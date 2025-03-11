# logic/scoring.py

import sqlite3
from typing import Dict
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
      - learningDirectionLabel, learningStrengthLabel
      - applicationDirectionLabel, applicationStrengthLabel
      - overallCreativeStyle
    """

    # 1. Learning direction label
    if learning_score >= 0:
        learning_direction = "to Learn Through Experience"
    else:
        learning_direction = "to Learn Through Contemplation"

    # 2. Learning strength label
    abs_learn = abs(learning_score)
    if abs_learn >= 1 and abs_learn <= 9:
        learning_strength = "Slight Preference"
    elif abs_learn >= 10 and abs_learn <= 18:
        learning_strength = "Solid Preference"
    elif abs_learn >= 19:
        learning_strength = "Strong Preference"
    else:
        learning_strength = "No Preference"  # e.g., if learning_score == 0

    # 3. Application direction label
    if application_score >= 0:
        application_direction = "to Apply Knowledge for Ideation"
    else:
        application_direction = "to Apply Knowledge for Production"

    # 4. Application strength label
    abs_app = abs(application_score)
    if abs_app >= 1 and abs_app <= 9:
        application_strength = "Slight Preference"
    elif abs_app >= 10 and abs_app <= 18:
        application_strength = "Solid Preference"
    elif abs_app >= 19:
        application_strength = "Strong Preference"
    else:
        application_strength = "No Preference"  # if application_score == 0

    # 5. Overall Creative Style
    if learning_score >= 0 and application_score >= 0:
        overall_style = "Intuitive Creative Style"
    elif learning_score < 0 and application_score >= 0:
        overall_style = "Conceptual Creative Style"
    elif learning_score < 0 and application_score < 0:
        overall_style = "Pragmatic Creative Style"
    else:  # learning_score >= 0 and application_score < 0
        overall_style = "Deductive Creative Style"

    return {
        "learning_direction": learning_direction,
        "learning_strength": learning_strength,
        "application_direction": application_direction,
        "application_strength": application_strength,
        "overall_style": overall_style
    }