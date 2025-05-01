import requests
import time

API_URL = "http://localhost:5000"
PREDICT_ENDPOINT = f"{API_URL}/predict"
RESULT_ENDPOINT = f"{API_URL}/result"

test_cases = [
    {"description": "A cold snowy place with high mountains and glaciers", "expected": "Norway"},
    {"description": "A desert with pyramids and ancient civilization", "expected": "Egypt"},
    {"description": "A tropical island with beaches and volcanoes", "expected": "Indonesia"},
    {"description": "A country famous for sushi, cherry blossoms and Mount Fuji", "expected": "Japan"},
    {"description": "Land of kangaroos and the Great Barrier Reef", "expected": "Australia"},
]

def submit_job(description):
    response = requests.post(PREDICT_ENDPOINT, json={"description": description})
    return response.json() if response.status_code == 200 else None

def poll_result(job_id, timeout=20):
    for _ in range(timeout):
        res = requests.get(f"{RESULT_ENDPOINT}/{job_id}")
        if res.status_code == 200:
            data = res.json()
            if data['status'] == 'done':
                return data['result']
        time.sleep(1)
    return None

def run_tests():
    with open("test_results.txt", "w") as f:
        def log(msg):
            print(msg)
            f.write(msg + "\n")

        log("Starting test suite...\n")
        results_summary = []

        for i, test in enumerate(test_cases):
            log(f"Test {i + 1}: {test['description']}")
            job = submit_job(test['description'])
            if not job:
                log("❌ Failed to submit job\n")
                continue

            job_id = job["job_id"]
            result = poll_result(job_id)

            if result:
                predicted_countries = [r["country"] for r in result]
                expected = test['expected']
                log(f"Expected: {expected}, Predicted: {predicted_countries}")
                passed = expected in predicted_countries
                log("✅ PASS\n" if passed else "❌ FAIL\n")
                results_summary.append((test['description'], expected, predicted_countries, passed))
            else:
                log("❌ No result returned in time\n")
                results_summary.append((test['description'], test['expected'], [], False))

        log("Running basic error tests...\n")
        r = requests.post(PREDICT_ENDPOINT, json={"description": ""})
        log("Empty description test: " + ("✅ PASS" if r.status_code == 400 else "❌ FAIL"))

        r = requests.get(f"{RESULT_ENDPOINT}/invalid-id-1234")
        log("Invalid job ID test: " + ("✅ PASS\n" if r.status_code == 404 else "❌ FAIL\n"))

        log("\n--- Test Summary ---")
        for desc, expected, predicted, passed in results_summary:
            status = "PASS" if passed else "FAIL"
            log(f"Description: {desc}\nExpected: {expected}, Predicted: {predicted}, Result: {status}\n")

if __name__ == "__main__":
    run_tests()
