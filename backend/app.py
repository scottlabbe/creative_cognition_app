# app.py file

import os
import uuid
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from logic.scoring import compute_scores, categorize_scores, get_detailed_profile
from plots.generate_plot import generate_plot
from logic.db_helpers import get_connection

# Import the admin and auth blueprints
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp

app = Flask(
    __name__,
    static_folder='static',  # Keep your current static folder for API assets
    static_url_path='/static')  # Keep the static path as is

# In app.py
CORS(app, resources={r"/api/*": {
    "origins": "*"
}}, supports_credentials=True)  # Enable CORS for all routes

# Keep your existing config/setup code
SCALE_QUESTIONS_PATH = "data/scale_questions.json"
TEXT_QUESTIONS_PATH = "data/text_questions.json"

with open(SCALE_QUESTIONS_PATH, "r", encoding="utf-8") as f:
    scale_data = json.load(f)
scale_questions = scale_data["questions"]

with open(TEXT_QUESTIONS_PATH, "r", encoding="utf-8") as f:
    text_data = json.load(f)
text_questions = text_data["questions"]

# Combine them into one list to keep a single question flow
all_questions = scale_questions + text_questions


def create_tables_if_not_exists():
    """Creates tables from your schema.sql if you haven't already, or just ensure existence."""
    # Minimal approach: run the schema statements inline or read from schema.sql
    schema_sql = """
    CREATE TABLE IF NOT EXISTS submissions (
        submission_id TEXT PRIMARY KEY,
        user_name TEXT,
        user_email TEXT,
        submission_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_complete INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS submission_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_id TEXT,
        question_id TEXT,
        numeric_response INTEGER,
        text_response TEXT,
        response_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions (submission_id)
    );
    """
    conn = get_connection()
    conn.executescript(schema_sql)
    conn.commit()
    conn.close()


# Call table-creation on startup
create_tables_if_not_exists()

# 2. ROUTES


@app.route("/api/questions", methods=["GET"])
def get_questions():
    """Return all questions data"""
    return jsonify({"questions": all_questions, "total": len(all_questions)})


@app.route("/api/start", methods=["POST"])
def start_submission():
    """Create new submission and return submission_id"""
    data = request.json
    user_name = data.get("name", "")
    user_email = data.get("email", "")
    submission_id = str(uuid.uuid4())

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO submissions (submission_id, user_name, user_email)
        VALUES (?, ?, ?)
    """, (submission_id, user_name, user_email))
    conn.commit()
    conn.close()

    return jsonify({"submission_id": submission_id, "status": "success"})


@app.route("/api/submit-response", methods=["POST"])
def submit_response():
    """Save a question response"""
    data = request.json
    submission_id = data.get("submission_id")
    question_id = data.get("question_id")
    numeric_response = data.get("numeric_response")
    text_response = data.get("text_response")

    conn = get_connection()
    cur = conn.cursor()

    if numeric_response is not None:
        cur.execute(
            """
            INSERT INTO submission_responses (submission_id, question_id, numeric_response)
            VALUES (?, ?, ?)
        """, (submission_id, question_id, numeric_response))
    else:
        cur.execute(
            """
            INSERT INTO submission_responses (submission_id, question_id, text_response)
            VALUES (?, ?, ?)
        """, (submission_id, question_id, text_response))

    conn.commit()
    conn.close()

    return jsonify({"status": "success", "message": "Response recorded"})


@app.route("/api/complete/<submission_id>", methods=["POST"])
def complete_submission(submission_id):
    """Mark a submission as complete"""
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Check if submission exists
        cur.execute(
            """
            SELECT submission_id FROM submissions
            WHERE submission_id = ?
        """, (submission_id, ))

        if not cur.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "message": "Submission not found"
            }), 404

        # Update submission to mark as complete
        cur.execute(
            """
            UPDATE submissions
            SET is_complete = 1
            WHERE submission_id = ?
        """, (submission_id, ))

        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "message": "Submission marked as complete"
        })
    except Exception as e:
        print(f"Error completing submission: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Could not complete submission"
        }), 500


@app.route("/api/results/<submission_id>")
def get_results(submission_id):
    """Get computed results for a submission"""
    try:
        # Get scores and labels
        scores = compute_scores(submission_id, all_questions)
        labels = categorize_scores(scores["learning_score"],
                                   scores["application_score"])

        # Get detailed profile
        detailed_profile = get_detailed_profile(submission_id, all_questions)
        if detailed_profile is None:
            return jsonify({"error":
                            "Could not generate detailed profile"}), 500

        # Generate plot
        try:
            plot_filename = generate_plot(scores["application_score"],
                                          scores["learning_score"],
                                          submission_id)
        except Exception as e:
            print(f"Error generating plot: {str(e)}")
            plot_filename = None

        # Return structured response
        return jsonify({
            "scores": {
                "learning_score": scores["learning_score"],
                "application_score": scores["application_score"]
            },
            "labels":
            labels,
            "detailed_profile":
            detailed_profile,
            "plot_url":
            f"/static/plots/{plot_filename}" if plot_filename else None
        })

    except Exception as e:
        print(f"Error generating results: {str(e)}")
        return jsonify({"error": "Could not generate results"}), 500


@app.route('/static/js/<filename>')
def serve_js(filename):
    return send_from_directory('../frontend/build/static/js', filename)


@app.route('/static/css/<filename>')
def serve_css(filename):
    return send_from_directory('../frontend/build/static/css', filename)


@app.route('/static/media/<filename>')
def serve_media(filename):
    return send_from_directory('../frontend/build/static/media', filename)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # First try to serve from your static folder
    if path.startswith('api/'):
        return app.send_static_file(path)
    # Then try to serve from frontend build folder if it exists
    frontend_path = os.path.join('../frontend/build', path)
    if os.path.exists(frontend_path) and os.path.isfile(frontend_path):
        return send_from_directory('../frontend/build', path)
    # Default to serving index.html from frontend build
    return send_from_directory('../frontend/build', 'index.html')


# Register the admin and auth blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    # Use the PORT environment variable for Replit
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
