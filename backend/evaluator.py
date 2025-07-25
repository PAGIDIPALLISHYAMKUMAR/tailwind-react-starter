from fastapi import APIRouter, Request
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import os
import requests
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# ✅ Firebase Initialization
if not firebase_admin._apps:
    cred = credentials.Certificate("credentials/serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ✅ Together AI Config
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_URL = "https://api.together.xyz/v1/chat/completions"
MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

@router.post("/evaluate-answer")
async def evaluate_answer(request: Request):
    try:
        data = await request.json()
        question = data.get("question")
        answer = data.get("answer")
        user = data.get("user")

        # 🔍 Evaluate using helper
        feedback = evaluate_with_gpt(question, answer)

        # ✅ Save to Firebase
        db.collection("interview_sessions").add({
            "user": user,
            "question": question,
            "answer": answer,
            "feedback": feedback,
            "timestamp": datetime.utcnow()
        })

        return {"evaluation": feedback}

    except Exception as e:
        print("❌ Evaluation Error:", str(e))
        return {"evaluation": "❌ Error evaluating your answer. Please check backend logs."}


# ✅ Utility used by resume_session.py
def evaluate_with_gpt(question, answer):
    try:
        prompt = f"""
You are a strict but fair senior interviewer.

Evaluate the candidate's answer below.

Question: {question}
Answer: {answer}

Provide your response in this exact format:

Score: <1-5>
Constructive feedback: <one sentence of feedback>
Correct Answer: <complete answer>

Only return these 3 lines.
"""

        headers = {
            "Authorization": f"Bearer {TOGETHER_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
        }

        res = requests.post(TOGETHER_URL, headers=headers, json=payload)
        res.raise_for_status()

        content = res.json()["choices"][0]["message"]["content"].strip()
        print("✅ GPT Evaluation:\n", content)
        return content

    except Exception as e:
        print("❌ GPT Evaluation Error:", str(e))
        return "Score: 1\nConstructive feedback: Evaluation failed.\nCorrect Answer: Not available."
