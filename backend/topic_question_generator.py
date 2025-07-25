import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_URL = "https://api.together.xyz/v1/chat/completions"
MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

def generate_questions_by_topic(topic: str, difficulty: str):
    prompt = f"""
You are a interviewer.
Generate 5 technical interview questions on the topic "{topic}" with {difficulty} difficulty.
Respond with one question per line.
"""

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
    }

    response = requests.post(TOGETHER_URL, headers=headers, json=payload)
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]

    return [q.strip() for q in content.strip().split("\n") if q.strip()]
