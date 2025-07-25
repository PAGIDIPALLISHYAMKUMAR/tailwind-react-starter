from fastapi import APIRouter, Request
import os
import requests
import re
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()  # <-- ✅ This must be defined before any decorators

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_URL = "https://api.together.xyz/v1/chat/completions"
MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

@router.post("/topic-evaluate")
async def topic_evaluate(request: Request):
    try:
        body = await request.json()
        question = body.get("question")
        answer = body.get("answer")

        prompt = f"""
You are an expert interviewer.
Evaluate the candidate's answer to the following question.

Question: {question}
Answer: {answer}

Provide:
1. Score (out of 5)
2. Give feedback
3. The correct answer
"""

        headers = {
            "Authorization": f"Bearer {TOGETHER_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }

        res = requests.post(TOGETHER_URL, headers=headers, json=payload)
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"].strip()

        print("🔍 Raw GPT Output:\n", content)  # helpful for debugging

        # ✅ Use regex for safe extraction
        score_match = re.search(r"Score\s*[:\-]?\s*(\d(?:\.\d)?)/?5?", content, re.IGNORECASE)
        feedback_match = re.search(r"feedback\s*[:\-]?\s*(.+)", content, re.IGNORECASE)
        correct_answer_match = re.search(r"Correct Answer\s*[:\-]?\s*(.+)", content, re.IGNORECASE)

        score = score_match.group(1) if score_match else "N/A"
        feedback = feedback_match.group(1).strip() if feedback_match else "N/A"
        correct_answer = correct_answer_match.group(1).strip() if correct_answer_match else "N/A"

        return {
            "feedback": f"1. Score: {score}/5\nFeedback: {feedback}",
            "correct_answer": correct_answer
        }

    except Exception as e:
        print("❌ Evaluation Error:", str(e))
        return {"error": "Evaluation failed. Check backend logs."}
