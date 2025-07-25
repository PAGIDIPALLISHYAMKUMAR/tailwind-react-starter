# backend/routes/resume_question_generator.py
from fastapi import APIRouter, UploadFile, File
from resume_parser import extract_text_from_pdf
import os
import uuid
import requests
import tempfile

router = APIRouter()

# 🔑 Replace this with your real key or load from environment
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_URL = "https://api.together.xyz/v1/chat/completions"
MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

@router.post("/generate-questions-from-resume")
async def generate_questions(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Extract text
        resume_text = extract_text_from_pdf(tmp_path)
        os.unlink(tmp_path)

        # Construct prompt
        prompt = f"""
You're a senior DevOps interviewer.
Generate 5 technical DevOps interview questions based on the following resume:

{resume_text}

Only output the questions in a numbered list.
"""

        headers = {
            "Authorization": f"Bearer {TOGETHER_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}]
        }

        response = requests.post(TOGETHER_URL, headers=headers, json=payload)
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"].strip()

        return {"questions": content}

    except Exception as e:
        return {"error": str(e)}
