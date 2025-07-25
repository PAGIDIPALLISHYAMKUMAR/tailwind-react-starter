# resume_review.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import fitz  # PyMuPDF
import requests
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"

def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

@router.post("/resume-review")
async def resume_review(file: UploadFile = File(...), role: str = Form(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        resume_text = extract_text_from_pdf(file_path)
        prompt = f"""
You're an expert career advisor. Review the following resume text for the role of {role}. Provide a structured and detailed analysis with the following format:

1. ✅ **Strengths** – Highlight specific strengths relevant to {role}
2. ⚠️ **Weaknesses** – Mention areas that could be improved
3. 🔧 **Suggestions** – How can the candidate improve the resume
4. key skills – List key skills relevant to {role}
4. 🎓 **Recommended Certifications** – Suggest role-relevant certifications

Resume:
{resume_text}
"""

        headers = {
            "Authorization": f"Bearer {TOGETHER_API_KEY}",
            "Content-Type": "application/json"
        }

        body = {
            "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
            "messages": [
                {"role": "system", "content": "You are a resume reviewer."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
        }

        response = requests.post(TOGETHER_API_URL, json=body, headers=headers)
        response.raise_for_status()
        feedback = response.json()["choices"][0]["message"]["content"]

        return {"feedback": feedback}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(file_path)
