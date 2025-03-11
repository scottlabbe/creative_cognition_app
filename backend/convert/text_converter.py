import pandas as pd
import json
from typing import Dict, List, Any
from pathlib import Path

def convert_text_questions_to_json(csv_file_path: str) -> Dict[str, Any]:
    """
    Convert text-based questions from CSV to JSON format.
    Specifically handles 4 text response questions.
    
    Args:
        csv_file_path (str): Path to the text questions CSV file
        
    Returns:
        dict: Dictionary containing the structured questionnaire data
    """
    try:
        # Read CSV file
        df = pd.read_csv(csv_file_path)
        
        # Convert data to list of dictionaries with proper structure
        questions = []
        for _, row in df.iterrows():
            question = {
                'id': row['id'],
                'category': row['category'],
                'question': row['question'],
                'responseType': 'text'
            }
            questions.append(question)
        
        # Group questions by category
        questions_by_category = {}
        for question in questions:
            category = question['category']
            if category not in questions_by_category:
                questions_by_category[category] = []
            questions_by_category[category].append(question)
        
        # Create final JSON structure
        final_json = {
            'metadata': {
                'totalQuestions': len(questions),
                'categories': list(questions_by_category.keys()),
                'type': 'text'
            },
            'questions': questions,
            'questionsByCategory': questions_by_category
        }
        
        return final_json

    except Exception as e:
        print(f"Error converting text questions CSV to JSON: {str(e)}")
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
    input_csv = r'/Users/scottlabbe/Projects/learning_type_app/data/text_questions.csv'
    output_json = r'/Users/scottlabbe/Projects/learning_type_app/data/text_questions.json'
    
    # Convert CSV to JSON
    json_data = convert_text_questions_to_json(input_csv)
    
    if json_data:
        # Save to file
        save_json_to_file(json_data, output_json)
        
        # Print summary
        print("\nText Questions Conversion Summary:")
        print(f"Total questions: {json_data['metadata']['totalQuestions']}")
        print(f"Categories: {', '.join(json_data['metadata']['categories'])}")

if __name__ == "__main__":
    main()