# backend/routes/admin_routes.py

from flask import Blueprint, request, jsonify
from auth.auth_middleware import admin_required
from logic.db_helpers import get_connection
import json
import os 
from logic.scoring import compute_scores, categorize_scores, get_detailed_profile

admin_bp = Blueprint('admin', __name__, url_prefix="/api/admin")

@admin_bp.route('/submissions', methods=['GET'])
@admin_required
def get_submissions():
    """Get all submissions with optional filtering."""
    try:
        # Get query parameters for filtering
        status = request.args.get('status')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Build the SQL query with possible filters
        query = "SELECT * FROM submissions"
        params = []
        
        # Add WHERE clause if filters are provided
        where_clauses = []
        if status:
            where_clauses.append("is_complete = ?")
            params.append(int(status))
        
        if date_from:
            where_clauses.append("submission_time >= ?")
            params.append(date_from)
        
        if date_to:
            where_clauses.append("submission_time <= ?")
            params.append(date_to)
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        # Add ordering
        query += " ORDER BY submission_time DESC"
        
        # Execute the query
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        
        # Convert to list of dictionaries
        submissions = []
        for row in cursor.fetchall():
            submissions.append({
                "submission_id": row[0],
                "user_name": row[1],
                "user_email": row[2],
                "submission_time": row[3],
                "is_complete": bool(row[4])
            })
        
        conn.close()
        
        return jsonify({"submissions": submissions})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/submissions/<submission_id>', methods=['GET'])
@admin_required
def get_submission_detail(submission_id):
    """Get detailed information about a specific submission."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get submission header
        cursor.execute("SELECT * FROM submissions WHERE submission_id = ?", (submission_id,))
        submission_row = cursor.fetchone()
        
        if not submission_row:
            conn.close()
            return jsonify({"error": "Submission not found"}), 404
        
        submission = {
            "submission_id": submission_row[0],
            "user_name": submission_row[1],
            "user_email": submission_row[2],
            "submission_time": submission_row[3],
            "is_complete": bool(submission_row[4])
        }
        
        # Get all responses for this submission
        cursor.execute("""
            SELECT question_id, numeric_response, text_response
            FROM submission_responses
            WHERE submission_id = ?
        """, (submission_id,))
        
        responses = []
        for row in cursor.fetchall():
            responses.append({
                "question_id": row[0],
                "numeric_response": row[1],
                "text_response": row[2]
            })
        
        submission["responses"] = responses
        
        conn.close()
        
        return jsonify(submission)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/simulate', methods=['POST'])
@admin_required
def simulate_results():
    """Generate results based on provided scores without saving to database."""
    try:
        data = request.json
        learning_score = int(data.get('learning_score', 0))
        application_score = int(data.get('application_score', 0))
        
        # Generate labels using the categorize_scores function
        labels = categorize_scores(learning_score, application_score)
        
        # Get detailed profile based on the style and learning strength
        style = labels["overall_style"]
        strength = labels["learning_strength"]
        detailed_profile = get_style_profile(style, strength)
        
        # Format the direction labels to match frontend expectations
        learning_direction_label = f"to Learn Through {labels['learning_direction']}"
        application_direction_label = f"to Apply Knowledge for {labels['application_direction']}"
        
        # Construct formatted labels
        formatted_labels = {
            "learning_direction": learning_direction_label,
            "learning_strength": labels["learning_strength"],
            "application_direction": application_direction_label,
            "application_strength": labels["application_strength"],
            "overall_style": labels["overall_style"].capitalize() + " Creative Style"
        }
        
        # Return structured response
        return jsonify({
            "scores": {
                "learning_score": learning_score,
                "application_score": application_score
            },
            "labels": formatted_labels,
            "detailed_profile": detailed_profile,
            "plot_url": None  # No plot for simulations
        })
    
    except Exception as e:
        print(f"Simulation error: {str(e)}")
        return jsonify({"error": str(e)}), 500
        
# Helper function to get style profile from creative_matrix.json
def get_style_profile(style_id, strength_level):
    """Get style profile data from creative_matrix.json"""
    try:
        matrix_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'creative_matrix.json')
        with open(matrix_path, 'r') as f:
            matrix_data = json.load(f)
        
        # Find the matching learning style
        learning_style = None
        for style in matrix_data["learningStyles"]:
            if style["id"] == style_id.lower():
                learning_style = style
                break
        
        if not learning_style:
            return {
                "style_description": "Style not found",
                "preference_description": "",
                "application_preference_description": "",
                "working_relationships": {
                    "intuitives": "",
                    "conceptuals": "",
                    "pragmatists": "",
                    "deductives": ""
                },
                "strengths": [""],
                "weaknesses": [""]
            }
        
        # Find preference descriptions based on strength level
        preference_description = ""
        application_preference_description = ""
        
        for pref in learning_style["preferences"]:
            if pref["strengthLevel"] == strength_level.lower():
                if pref["dimensionType"] == "learningMethod":
                    preference_description = pref["description"]
                elif pref["dimensionType"] == "knowledgeApplication":
                    application_preference_description = pref["description"]
        
        # Convert strengths and weaknesses to arrays if they're strings
        strengths = [learning_style["strengths"]] if isinstance(learning_style["strengths"], str) else learning_style["strengths"]
        weaknesses = [learning_style["weaknesses"]] if isinstance(learning_style["weaknesses"], str) else learning_style["weaknesses"]
        
        # Return the detailed profile in the format expected by the frontend
        return {
            "style_description": learning_style["description"],
            "preference_description": preference_description,
            "application_preference_description": application_preference_description,
            "working_relationships": {
                "intuitives": learning_style["workingWith"].get("intuitive", ""),
                "conceptuals": learning_style["workingWith"].get("conceptual", ""),
                "pragmatists": learning_style["workingWith"].get("pragmatic", ""),
                "deductives": learning_style["workingWith"].get("deductive", "")
            },
            "strengths": strengths,
            "weaknesses": weaknesses
        }
        
    except Exception as e:
        print(f"Error loading style profile: {str(e)}")
        return {
            "style_description": f"Error: {str(e)}",
            "preference_description": "",
            "application_preference_description": "",
            "working_relationships": {
                "intuitives": "",
                "conceptuals": "",
                "pragmatists": "",
                "deductives": ""
            },
            "strengths": [""],
            "weaknesses": [""]
        }