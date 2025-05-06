import requests
import time
import json

BASE_URL = "http://127.0.0.1:5001"  # Change if needed
PREDICT_ENDPOINT = f"{BASE_URL}/predict"
RESULT_ENDPOINT = f"{BASE_URL}/result"

samples = [
    {"input": "Thank you so much for going out of your way to help me. Your kindness, patience, and dedication truly made a difference and I’m incredibly grateful for everything.", "label": "good"},
    {"input": "Your insightful feedback during the team meeting helped us solve a critical issue. It’s always inspiring to see how you uplift everyone around you with your calm and wisdom.", "label": "good"},
    {"input": "I really admire the way you approached that tough situation. You stayed composed, thoughtful, and supportive, which helped ease the tension and brought the team together in a positive way.", "label": "good"},
    {"input": "You’ve consistently shown professionalism, honesty, and empathy in everything you do. People trust your judgment and appreciate your presence. It’s a pleasure to collaborate with someone so responsible.", "label": "good"},
    {"input": "Wishing you nothing but peace, joy, and great success in the days ahead. Your dedication and integrity are recognized and celebrated. Keep being the wonderful person you are.", "label": "good"},
    {"input": "You’re an absolute disgrace. Everything you do is pathetic and stupid. People laugh behind your back because you're clueless, incompetent, and a waste of space who brings everyone down.", "label": "bad"},
    {"input": "I can’t believe how incredibly useless you are at everything. You constantly mess things up, annoy everyone, and should honestly just stop trying. Nobody respects or values your opinions.", "label": "bad"},
    {"input": "You are such an arrogant piece of garbage. The way you talk to others is disgusting, and your fake confidence is laughable. You deserve every bit of hate you get.", "label": "bad"},
    {"input": "Every time you speak, it becomes clear you're the dumbest person in the room. You lack basic intelligence and should really consider keeping quiet to spare us all the headache.", "label": "bad"},
    {"input": "People avoid working with you because you're toxic, lazy, and impossible to trust. You twist stories, create problems, and never take responsibility. You’re the worst kind of teammate imaginable.", "label": "bad"}
]

def predict_label(result_dict):
    # Check if any field exceeds 0.7
    thresholds = [
        result_dict.get("identity_attack", 0),
        result_dict.get("insult", 0),
        result_dict.get("obscene", 0),
        result_dict.get("severe_toxicity", 0),
        result_dict.get("threat", 0),
        result_dict.get("toxicity", 0)
    ]
    return "bad" if any(score > 0.7 for score in thresholds) else "good"

results = []
summary_table = []

for idx, sample in enumerate(samples, 1):
    start_time = time.time()  # Start time for the test case

    response = requests.post(PREDICT_ENDPOINT, json={"description": sample["input"]})
    if response.status_code != 200:
        print(f"Failed to submit sample {idx}")
        continue
    job_id = response.json()["job_id"]

    while True:
        time.sleep(1)
        res = requests.get(f"{RESULT_ENDPOINT}/{job_id}")
        if res.status_code != 200:
            print(f"Job {job_id} not found")
            break
        data = res.json()
        if data["status"] == "done":
            break

    prediction = predict_label(data["result"])

    duration = time.time() - start_time  # Calculate duration

    result_entry = {
        "input": sample["input"],
        "label": sample["label"],
        "job_id": job_id,
        "result": data,
        "predicted_label": prediction,
        "duration": duration  # Store duration
    }

    results.append(result_entry)
    summary_table.append((idx, sample["label"], prediction, duration))  # Add duration to summary

# Write full result and table
with open("results.txt", "w", encoding="utf-8") as f:
    for entry in results:
        f.write(json.dumps(entry, indent=2, ensure_ascii=False))
        f.write("\n\n")

    # Add summary table
    f.write("\nSummary Table:\n")
    f.write("+----+-----------+------------+------------+\n")
    f.write("| #  | Expected  | Predicted  | Duration   |\n")
    f.write("+----+-----------+------------+------------+\n")
    for row in summary_table:
        f.write(f"| {row[0]:<2} | {row[1]:<9} | {row[2]:<10} | {row[3]:<10.4f} |\n")
    f.write("+----+-----------+------------+------------+\n")

# --- Invalid /predict tests ---
predict_invalid_tests = [
    {"desc": "Empty input", "payload": {}, "type": "json"},
    {"desc": "Missing 'description'", "payload": {"msg": "hi"}, "type": "json"},
    {"desc": "Wrong key", "payload": {"text": "hi"}, "type": "json"},
    {"desc": "Non-JSON plain text", "payload": "plain text", "type": "text"},
    {"desc": "description as int", "payload": {"description": 12345}, "type": "json"},
]

predict_invalid_results = []

for idx, test in enumerate(predict_invalid_tests, 1):
    try:
        start_time = time.time()  # Start timing

        if test["type"] == "json":
            res = requests.post(PREDICT_ENDPOINT, json=test["payload"])
        else:
            res = requests.post(PREDICT_ENDPOINT, data=test["payload"])

        duration = time.time() - start_time  # Calculate duration
        result_status = "Pass" if res.status_code == 400 or 415 else "Fail"
        predict_invalid_results.append((idx, test["desc"], result_status, res.status_code, res.text[:150], duration))
    except Exception as e:
        duration = time.time() - start_time  # Calculate duration even if an error occurs
        predict_invalid_results.append((idx, test["desc"], "Error", "Exception", str(e), duration))

# --- Invalid /result/<job_id> tests ---
result_invalid_tests = [
    {"desc": "Non-existent job ID", "job_id": "nonexistent-job-id-123"},
    {"desc": "Empty job ID", "job_id": ""},
    {"desc": "Malformed UUID", "job_id": "123"},
    {"desc": "Special characters", "job_id": "@#$%^&*()"},
    {"desc": "Numeric ID", "job_id": "1234567890"},
]

result_invalid_results = []

for idx, test in enumerate(result_invalid_tests, 1):
    try:
        start_time = time.time()  # Start timing

        res = requests.get(f"{RESULT_ENDPOINT}/{test['job_id']}")
        duration = time.time() - start_time  # Calculate duration
        result_status = "Pass" if res.status_code == 404 else "Fail"
        result_invalid_results.append((idx, test["desc"], result_status, res.status_code, res.text[:150], duration))
    except Exception as e:
        duration = time.time() - start_time  # Calculate duration even if an error occurs
        result_invalid_results.append((idx, test["desc"], "Error", "Exception", str(e), duration))

# --- Write to results.txt ---
with open("results.txt", "a", encoding="utf-8") as f:
    # /predict
    f.write("\n[Invalid /predict Requests]\n")
    f.write("+----+-----------------------------+--------+------------+\n")
    f.write("| #  | Test Description            | Result | Duration   |\n")
    f.write("+----+-----------------------------+--------+------------+\n")
    for row in predict_invalid_results:
        f.write(f"| {row[0]:<2} | {row[1]:<27} | {row[2]:<6} | {row[5]:<10.4f} |\n")
    f.write("+----+-----------------------------+--------+------------+\n")

    f.write("\nDetails:\n")
    for row in predict_invalid_results:
        f.write(f"\nTest {row[0]} - {row[1]}\nStatus Code: {row[3]}\nResponse: {row[4]}\nDuration: {row[5]:.4f} seconds\n")

    # /result/<job_id>
    f.write("\n[Invalid /result/<job_id> Requests]\n")
    f.write("+----+-----------------------------+--------+------------+\n")
    f.write("| #  | Test Description            | Result | Duration   |\n")
    f.write("+----+-----------------------------+--------+------------+\n")
    for row in result_invalid_results:
        f.write(f"| {row[0]:<2} | {row[1]:<27} | {row[2]:<6} | {row[5]:<10.4f} |\n")
    f.write("+----+-----------------------------+--------+------------+\n")

    f.write("\nDetails:\n")
    for row in result_invalid_results:
        f.write(f"\nTest {row[0]} - {row[1]}\nStatus Code: {row[3]}\nResponse: {row[4]}\nDuration: {row[5]:.4f} seconds\n")

print("All tests complete and written to results.txt.")
