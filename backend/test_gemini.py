import requests

response = requests.post("http://127.0.0.1:8000/evaluate-answer", json={
    "question": "What is CI/CD?",
    "answer": "CI/CD is automation of code integration and deployment.",
    "user": "shyam"
})

print(response.json())
