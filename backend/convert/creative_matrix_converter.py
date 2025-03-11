import pandas as pd
import json
import re
import os

def excel_to_json(input_excel, output_json):
    # Read the Excel file
    df = pd.read_excel(input_excel, header=None)
    
    # Initialize the data structure
    data = {
        "learningStyles": [],
        "preferenceStrengths": [
            {
                "id": "strong",
                "name": "Strong Preference",
                "description": "Most pronounced tendency"
            },
            {
                "id": "solid",
                "name": "Solid Preference",
                "description": "Moderate tendency"
            },
            {
                "id": "slight",
                "name": "Slight Preference",
                "description": "Mild tendency"
            }
        ],
        "preferenceDimensions": [
            {
                "id": "learningMethod",
                "name": "Learning Method",
                "values": [
                    {
                        "id": "experience",
                        "name": "Learn Through Experience",
                        "description": "Hands-on learning approach"
                    },
                    {
                        "id": "contemplation",
                        "name": "Learn Through Contemplation",
                        "description": "Theoretical learning approach"
                    }
                ]
            },
            {
                "id": "knowledgeApplication",
                "name": "Knowledge Application",
                "values": [
                    {
                        "id": "ideation",
                        "name": "Apply Knowledge for Ideation",
                        "description": "Using knowledge to create new ideas"
                    },
                    {
                        "id": "production",
                        "name": "Apply Knowledge for Production",
                        "description": "Using knowledge to implement ideas"
                    }
                ]
            }
        ]
    }
    
    # Find the rows containing learning style information
    style_rows = {}
    current_style = None
    
    # Skip the header row and identify style rows
    for i in range(1, len(df)):
        row = df.iloc[i]
        cell_value = str(row[0]) if not pd.isna(row[0]) else ""
        
        if "Creative Style" in cell_value:
            # Extract the style name (e.g., "Intuitive" from "Intuitive Creative Style")
            style_name = cell_value.split()[0].lower()
            current_style = style_name
            
            if current_style not in style_rows:
                style_rows[current_style] = []
            
            style_rows[current_style].append(i)
    
    # Process each learning style
    for style_name, rows in style_rows.items():
        # Create a learning style object
        learning_style = {
            "id": style_name.lower(),
            "name": df.iloc[rows[0]][0],  # Full style name
            "description": df.iloc[rows[0]][1],  # Description from first row
            "preferences": [],
            "workingWith": {},
            "strengths": df.iloc[rows[0]][9],
            "weaknesses": df.iloc[rows[0]][10]
        }
        
        # Process all rows for this style to extract preferences
        for row_idx in rows:
            row = df.iloc[row_idx]
            
            # Skip if there's no preference strength
            if pd.isna(row[2]) or not any(level in str(row[2]).lower() for level in ["strong", "solid", "slight"]):
                continue
                
            # Determine preference strength level
            strength = str(row[2]).lower()
            strength_level = ""
            if "strong" in strength:
                strength_level = "strong"
            elif "solid" in strength:
                strength_level = "solid"
            elif "slight" in strength:
                strength_level = "slight"
            
            # Determine preference dimension type and value
            preference_type = str(row[3]).lower() if not pd.isna(row[3]) else ""
            dimension_type = ""
            dimension_value = ""
            
            if "learn through experience" in preference_type:
                dimension_type = "learningMethod"
                dimension_value = "experience"
            elif "learn through contemplation" in preference_type:
                dimension_type = "learningMethod"
                dimension_value = "contemplation"
            elif "apply knowledge for ideation" in preference_type:
                dimension_type = "knowledgeApplication"
                dimension_value = "ideation"
            elif "apply knowledge for production" in preference_type:
                dimension_type = "knowledgeApplication"
                dimension_value = "production"
            
            # Only add valid preferences
            if strength_level and dimension_type and dimension_value:
                # Check if this preference already exists
                exists = False
                for pref in learning_style["preferences"]:
                    if pref["strengthLevel"] == strength_level and pref["dimensionType"] == dimension_type:
                        exists = True
                        break
                
                if not exists:
                    preference = {
                        "strengthLevel": strength_level,
                        "dimensionType": dimension_type,
                        "dimensionValue": dimension_value,
                        "description": row[4] if not pd.isna(row[4]) else ""
                    }
                    learning_style["preferences"].append(preference)
        
        # Extract working with information from the first row
        first_row = df.iloc[rows[0]]
        learning_style["workingWith"] = {
            "intuitive": first_row[5] if not pd.isna(first_row[5]) else "",
            "conceptual": first_row[6] if not pd.isna(first_row[6]) else "",
            "pragmatic": first_row[7] if not pd.isna(first_row[7]) else "",
            "deductive": first_row[8] if not pd.isna(first_row[8]) else ""
        }
        
        # Add the learning style to the data structure
        data["learningStyles"].append(learning_style)
    
    # Create the output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    
    # Write the JSON file
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"JSON file created successfully: {output_json}")
    return data

# File paths
input_csv = r'/Users/scottlabbe/Projects/learning_type_app/backend/data/Creative Types - Sheet1.xlsx'
output_json = r'/Users/scottlabbe/Projects/learning_type_app/data/creative_matrix.json'

# Convert Excel to JSON
result = excel_to_json(input_csv, output_json)