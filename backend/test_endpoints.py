import requests

# Base URL of your Flask app
BASE_URL = 'http://localhost:5001/api'  # match the port you chose

def test_get_questions():
    """Test getting all questions"""
    print("\n1. Testing GET /api/questions")
    try:
        response = requests.get(f'{BASE_URL}/questions')
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {response.headers}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Success! Got questions data:")
            print(f"Total questions: {data['total']}")
            print(f"First question: {data['questions'][0]['question']}")
        else:
            print("❌ Error getting questions:", response.status_code)
            print("Response:", response.text)
    except Exception as e:
        print(f"Exception occurred: {str(e)}")

def test_start_submission():
    """Test starting a new submission"""
    print("\n2. Testing POST /api/start")
    test_data = {
        "name": "Test User",
        "email": "test@example.com"
    }
    try:
        response = requests.post(
            f'{BASE_URL}/start', 
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {response.headers}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Success! Got submission ID:")
            print(f"Submission ID: {data['submission_id']}")
            return data['submission_id']
        else:
            print("❌ Error starting submission:", response.status_code)
            print("Response:", response.text)
            return None
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return None

def run_tests():
    print("Starting API Tests...")
    test_get_questions()
    submission_id = test_start_submission()

if __name__ == "__main__":
    run_tests()