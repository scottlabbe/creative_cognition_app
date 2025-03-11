import pandas as pd
import json
from typing import Dict, List, Any
from pathlib import Path

def convert_scale_questions_to_json(csv_file_path: str) -> Dict[str, Any]:
    """
    Convert scale-based questions from CSV to JSON format.
    Handles questions with normal and reverse scoring types.
    
    Args:
        csv_file_path (str): Path to the scale questions CSV file
        
    Returns:
        dict: Dictionary containing the structured questionnaire data
    """
    try:
        # Read CSV file
        df = pd.read_csv(csv_file_path)
        
        # Convert data to list of dictionaries with simplified structure
        questions = []
        for _, row in df.iterrows():
            question = {
                'id': row['id'],
                'category': row['category'],
                'question': row['question'],
                'scoreType': row['scoretype']
            }
            questions.append(question)
        
        # Group questions by category
        questions_by_category = {}
        for question in questions:
            category = question['category']
            if category not in questions_by_category:
                questions_by_category[category] = []
            # Create a copy without category field for the grouped version
            category_question = question.copy()
            del category_question['category']
            questions_by_category[category].append(category_question)
        
        # Create final JSON structure
        final_json = {
            'metadata': {
                'totalQuestions': len(questions),
                'categories': list(questions_by_category.keys()),
                'scaleRange': {
                    'min': int(df['scale_min'].iloc[0]),
                    'max': int(df['scale_max'].iloc[0])
                },
                'type': 'scale',
                'scoreTypes': {
                    'normal': 'Higher response adds to score',
                    'reverse': 'Higher response subtracts from score'
                }
            },
            'questions': questions,
            'questionsByCategory': questions_by_category
        }
        
        return final_json

    except Exception as e:
        print(f"Error converting scale questions CSV to JSON: {str(e)}")
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
    input_csv = r'/Users/scottlabbe/Projects/learning_type_app/data/scale_questions.csv'
    output_json = r'/Users/scottlabbe/Projects/learning_type_app/data/scale_questions.json'
    
    # Convert CSV to JSON
    json_data = convert_scale_questions_to_json(input_csv)
    
    if json_data:
        # Save to file
        save_json_to_file(json_data, output_json)
        
        # Print summary
        print("\nScale Questions Conversion Summary:")
        print(f"Total questions: {json_data['metadata']['totalQuestions']}")
        print(f"Categories: {', '.join(json_data['metadata']['categories'])}")
        print(f"Scale range: {json_data['metadata']['scaleRange']['min']} to {json_data['metadata']['scaleRange']['max']}")
        print("\nScore types found in questions:")
        score_types = set(q['scoreType'] for q in json_data['questions'])
        print(f"Types: {', '.join(score_types)}")

if __name__ == "__main__":
    main()