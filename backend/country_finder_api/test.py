import requests
import time
import json

BASE_URL = "http://127.0.0.1:5000"  # Adjust the URL if needed
PREDICT_ENDPOINT = f"{BASE_URL}/predict"
RESULT_ENDPOINT = f"{BASE_URL}/result"

# Sample inputs for testing
samples = [
    {"description": "A cold snowy place with high mountains and glaciers", "expected": "Norway"},
    {"description": "A desert with pyramids and ancient civilization", "expected": "Egypt"},
    {"description": "A tropical island with beaches and volcanoes", "expected": "Indonesia"},
    {"description": "A country famous for sushi, cherry blossoms and Mount Fuji", "expected": "Japan"},
    {"description": "Land of kangaroos and the Great Barrier Reef", "expected": "Australia"},
]

# Function to get predictions from the API and handle logic for validation
def submit_job(description):
    response = requests.post(PREDICT_ENDPOINT, json={"description": description})
    return response.json() if response.status_code == 200 else None

def poll_result(job_id, timeout=60):
    for _ in range(timeout):
        res = requests.get(f"{RESULT_ENDPOINT}/{job_id}")
        if res.status_code == 200:
            data = res.json()
            if data['status'] == 'done':
                return data['result']
        time.sleep(1)
    return None

# Function to run the test cases
def run_tests():
    with open("results.txt", "w") as f:
        def log(msg):
            print(msg)
            f.write(msg + "\n")

        log("Starting test suite...\n")
        results_summary = []

        for i, test in enumerate(samples, 1):
            log(f"Test {i}: {test['description']}")
            job = submit_job(test['description'])
            if not job:
                log("Failed to submit job\n")
                continue

            job_id = job["job_id"]
            result = poll_result(job_id)

            if result:
                predicted_countries = [r["country"] for r in result]
                expected = test['expected']
                log(f"Expected: {expected}, Predicted: {predicted_countries}")
                passed = expected in predicted_countries
                log("PASS\n" if passed else "FAIL\n")
                results_summary.append((test['description'], expected, predicted_countries, passed))
            else:
                log("No result returned in time\n")
                results_summary.append((test['description'], test['expected'], [], False))

        log("Running basic error tests...\n")
        r = requests.post(PREDICT_ENDPOINT, json={"description": ""})
        log("Empty description test: " + ("PASS" if r.status_code == 400 else "FAIL"))

        r = requests.get(f"{RESULT_ENDPOINT}/invalid-id-1234")
        log("Invalid job ID test: " + ("PASS\n" if r.status_code == 404 else "FAIL\n"))

        log("\n--- Test Summary ---")
        for desc, expected, predicted, passed in results_summary:
            status = "PASS" if passed else "FAIL"
            log(f"Description: {desc}\nExpected: {expected}, Predicted: {predicted}, Result: {status}\n")

        # Testing Invalid /predict requests
        log("\nRunning invalid /predict tests...\n")
        invalid_predict_tests = [
            {"desc": "Empty description", "payload": {}, "type": "json"},
            {"desc": "Missing 'description'", "payload": {"msg": "hi"}, "type": "json"},
            {"desc": "Wrong key", "payload": {"text": "hi"}, "type": "json"},
            {"desc": "Non-JSON plain text", "payload": "plain text", "type": "text"},
            {"desc": "Description as integer", "payload": {"description": 12345}, "type": "json"},
        ]
        for test in invalid_predict_tests:
            try:
                start_time = time.time()
                if test["type"] == "json":
                    res = requests.post(PREDICT_ENDPOINT, json=test["payload"])
                else:
                    res = requests.post(PREDICT_ENDPOINT, data=test["payload"])
                duration = time.time() - start_time
                status = "Pass" if res.status_code == 400 or 415 else "Fail"
                log(f"{test['desc']} - Result: {status}, Duration: {duration:.4f}s")
            except Exception as e:
                log(f"Error with test {test['desc']}: {e}")

        # Testing Invalid /result/<job_id> requests
        log("\nRunning invalid /result/<job_id> tests...\n")
        invalid_result_tests = [
            {"desc": "Non-existent job ID", "job_id": "nonexistent-job-id-123"},
            {"desc": "Empty job ID", "job_id": ""},
            {"desc": "Malformed UUID", "job_id": "123"},
            {"desc": "Special characters in job ID", "job_id": "@#$%^&*()"},
            {"desc": "Numeric job ID", "job_id": "1234567890"},
        ]
        for test in invalid_result_tests:
            try:
                start_time = time.time()
                res = requests.get(f"{RESULT_ENDPOINT}/{test['job_id']}")
                duration = time.time() - start_time
                status = "Pass" if res.status_code == 404 else "Fail"
                log(f"{test['desc']} - Result: {status}, Duration: {duration:.4f}s")
            except Exception as e:
                log(f"Error with test {test['desc']}: {e}")

        log("\n--- End of Test Suite ---")

if __name__ == "__main__":
    run_tests()
