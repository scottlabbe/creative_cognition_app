# logic/scoring.py

import json
from typing import Dict, Any, List, Optional
from logic.db_helpers import get_connection

def compute_scores(submission_id: str, question_list: list) -> Dict[str, float]:
    """
    Reads the submission's numeric responses from the database.
    Uses question_list to figure out normal vs. reverse, category, etc.
    Returns numeric results (learning_score, application_score).
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT question_id, numeric_response
        FROM submission_responses
        WHERE submission_id = ?
        AND numeric_response IS NOT NULL
    """, (submission_id,))
    rows = cursor.fetchall()
    conn.close()

    response_map = {row[0]: row[1] for row in rows}

    learning_total = 0
    application_total = 0

    for q in question_list:
        qid = q["id"]
        cat = q.get("category")             # "Learning" or "Application"
        score_type = q.get("scoreType")     # "normal" or "reverse"
        
        if qid in response_map:
            raw_resp = response_map[qid]
            if score_type == "reverse":
                effective_val = 4 - raw_resp
            else:  # normal
                effective_val = raw_resp - 4

            if cat == "Learning":
                learning_total += effective_val
            elif cat == "Application":
                application_total += effective_val

    return {
        "learning_score": learning_total,
        "application_score": application_total
    }

def categorize_scores(learning_score: float, application_score: float) -> Dict[str, str]:
    """
    Returns a dictionary of labels based on the numeric scores:
      - learning_direction, learning_strength
      - application_direction, application_strength
      - overall_style
    """
    # 1. Learning direction label
    if learning_score >= 0:
        learning_direction = "Experience"
    else:
        learning_direction = "Contemplation"

    # 2. Learning strength label
    abs_learn = abs(learning_score)
    if abs_learn >= 1 and abs_learn <= 9:
        learning_strength = "slight"
    elif abs_learn >= 10 and abs_learn <= 18:
        learning_strength = "solid"
    elif abs_learn >= 19:
        learning_strength = "strong"
    else:
        learning_strength = "slight"  # Default to slight if 0

    # 3. Application direction label
    if application_score >= 0:
        application_direction = "Ideation"
    else:
        application_direction = "Production"

    # 4. Application strength label
    abs_app = abs(application_score)
    if abs_app >= 1 and abs_app <= 9:
        application_strength = "slight"
    elif abs_app >= 10 and abs_app <= 18:
        application_strength = "solid"
    elif abs_app >= 19:
        application_strength = "strong"
    else:
        application_strength = "slight"  # Default to slight if 0

    # 5. Overall Creative Style
    if learning_score >= 0 and application_score >= 0:
        overall_style = "intuitive"
    elif learning_score < 0 and application_score >= 0:
        overall_style = "conceptual"
    elif learning_score < 0 and application_score < 0:
        overall_style = "pragmatic"
    else:  # learning_score >= 0 and application_score < 0
        overall_style = "deductive"

    return {
        "learning_direction": learning_direction,
        "learning_strength": learning_strength,
        "application_direction": application_direction,
        "application_strength": application_strength,
        "overall_style": overall_style
    }

def find_preference_description(learning_style: Dict, strength_level: str, dimension_type: str, dimension_value: str) -> str:
    """
    Find the description for a specific preference in a learning style.
    """
    for preference in learning_style["preferences"]:
        if (preference["strengthLevel"] == strength_level and 
            preference["dimensionType"] == dimension_type and 
            preference["dimensionValue"] == dimension_value):
            return preference["description"]
    return ""

def get_detailed_profile(submission_id: str, question_list: list) -> Dict[str, Any]:
    """
    Generates a detailed learning profile based on submission responses.
    Using the new creative_matrix.json structure.
    """
    try:
        # Calculate basic scores and categories
        scores = compute_scores(submission_id, question_list)
        categories = categorize_scores(scores["learning_score"], scores["application_score"])
        
        # Load creative matrix data
        with open("data/creative_matrix.json", 'r') as f:
            matrix_data = json.load(f)
        
        # Find the matching learning style
        style_id = categories["overall_style"]
        learning_style = None
        
        for style in matrix_data["learningStyles"]:
            if style["id"] == style_id:
                learning_style = style
                break
        
        if not learning_style:
            raise ValueError(f"Learning style with id '{style_id}' not found")

        # Get the correct preference descriptions
        learning_strength = categories["learning_strength"]
        learning_direction = categories["learning_direction"].lower()
        application_strength = categories["application_strength"]
        application_direction = categories["application_direction"].lower()
        
        # Find preference descriptions
        learning_preference_description = find_preference_description(
            learning_style, 
            learning_strength, 
            "learningMethod", 
            learning_direction.lower()
        )
        
        application_preference_description = find_preference_description(
            learning_style,
            application_strength,
            "knowledgeApplication",
            application_direction.lower()
        )
        
        # Return in the same structure as before to maintain frontend compatibility
        return {
            "style_description": learning_style["description"],
            "preference_description": learning_preference_description,
            "application_preference_description": application_preference_description,
            "working_relationships": {
                "intuitives": learning_style["workingWith"]["intuitive"],
                "conceptuals": learning_style["workingWith"]["conceptual"],
                "pragmatists": learning_style["workingWith"]["pragmatic"],
                "deductives": learning_style["workingWith"]["deductive"]
            },
            "strengths": [learning_style["strengths"]],  # Packaged as a list to match current structure
            "weaknesses": [learning_style["weaknesses"]]  # Packaged as a list to match current structure
        }
        
    except Exception as e:
        print(f"Error generating detailed profile: {str(e)}")
        # Return empty structure instead of None to avoid frontend errors
        return {
            "style_description": "",
            "preference_description": "",
            "application_preference_description": "",
            "working_relationships": {
                "intuitives": "",
                "conceptuals": "",
                "pragmat    ists": "",
                "deductives": ""
            },
            "strengths": [],
            "weaknesses": []
        }