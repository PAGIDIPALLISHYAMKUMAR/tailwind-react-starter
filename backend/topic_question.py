# topic_question.py

from fastapi import APIRouter, Request
import os
import requests
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_URL = "https://api.together.xyz/v1/chat/completions"
MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

@router.post("/topic-question")
async def generate_topic_questions(request: Request):
    try:
        body = await request.json()
        topic = body.get("topic")
        difficulty = body.get("difficulty", "Easy")

        if not topic:
            return {"error": "Missing topic"}

        prompt = f"""
Generate 5 {difficulty}-level interview questions on the topic: {topic}.
Format as a numbered list.
"""

        headers = {
            "Authorization": f"Bearer {TOGETHER_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }

        res = requests.post(TOGETHER_URL, headers=headers, json=payload)
        res.raise_for_status()

        content = res.json()["choices"][0]["message"]["content"]
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        questions = [line.split(". ", 1)[-1].strip() for line in lines if line[0].isdigit()]

        return {"questions": questions}

    except Exception as e:
        print("❌ Error in topic-question:", str(e))
        return {"error": str(e)}
