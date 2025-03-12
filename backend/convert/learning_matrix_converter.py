import pandas as pd
import json
from typing import Dict, List, Any
from pathlib import Path

def convert_learning_matrix_to_json(csv_file_path: str) -> Dict[str, Any]:
    """
    Convert learning matrix data from CSV to JSON format.
    Structures the data by creative styles and strength levels.
    
    Args:
        csv_file_path (str): Path to the learning matrix CSV file
        
    Returns:
        dict: Dictionary containing the structured learning styles data
    """
    try:
        # Read CSV file
        df = pd.read_csv(csv_file_path)
        
        # Initialize structure for all styles
        styles_data = {}
        style_names = df['Style'].unique()
        
        for style_name in style_names:
            style_rows = df[df['Style'] == style_name]
            
            # Get the first row for base data (working with, strengths, weaknesses)
            first_row = style_rows.iloc[0]
            
            # Initialize style data structure
            styles_data[style_name.lower().replace(' creative style', '')] = {
                "base": {
                    "working_with": {
                        "intuitives": first_row['Working With: Intuitives'],
                        "conceptuals": first_row['Working With: Conceptuals'],
                        "pragmatists": first_row['Working With: Pragmatists'], 
                        "deductives": first_row['Working With: Deductives']
                    },
                    "strengths": first_row['Strengths'].split(';'),
                    "weaknesses": first_row['Weaknesses'].split(';')
                },
                "strength_levels": {
                    row['Strength'].lower().replace(' preference', ''): {
                        "description": row['Style Description'],  
                        "preference_description": row['Preference Description']
                    }
                    for _, row in style_rows.iterrows()
                }
            }
        
        # Create final JSON structure
        final_json = {
            "metadata": {
                "totalStyles": len(style_names),
                "styleNames": [style.lower().replace(' creative style', '') for style in style_names],
                "strengthLevels": ["strong", "solid", "slight"]
            },
            "styles": styles_data
        }
        
        return final_json

    except Exception as e:
        print(f"Error converting learning matrix CSV to JSON: {str(e)}")
        return None

def save_json_to_file(data: Dict[str, Any], output_file: str) -> None:
    """
    Save JSON data to a file with proper formatting.
    
    Args:
        data (dict): The JSON data to save
        output_file (str): Path to the output JSON file
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved JSON to {output_file}")
    except Exception as e:
        print(f"Error saving JSON to file: {str(e)}")

def main():
    # Input and output file paths
    input_csv = r'/Users/scottlabbe/Projects/learning_type_app/data/learning_matrix.csv'
    output_json = r'/Users/scottlabbe/Projects/learning_type_app/data/learning_matrix.json'
    
    # Convert CSV to JSON
    json_data = convert_learning_matrix_to_json(str(input_csv))
    
    if json_data:
        # Save to file
        save_json_to_file(json_data, str(output_json))
        
        # Print summary
        print("\nLearning Matrix Conversion Summary:")
        print(f"Total styles: {json_data['metadata']['totalStyles']}")
        print(f"Styles: {', '.join(json_data['metadata']['styleNames'])}")
        print(f"Strength levels: {', '.join(json_data['metadata']['strengthLevels'])}")


if __name__ == "__main__":
    main()