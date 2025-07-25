import fitz  # PyMuPDF
import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"
TOGETHER_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text = ""
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def generate_resume_questions(pdf_bytes: bytes) -> list:
    resume_text = extract_text_from_pdf(pdf_bytes)

    # Optional: Truncate long resumes
    if len(resume_text) > 3000:
        resume_text = resume_text[:3000]

    prompt = f"""
You are an expert interviewer. Based on the resume text below, generate 5 technical interview questions.

Resume:
{resume_text}

Questions:
"""

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": TOGETHER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "top_p": 1.0,
        "max_tokens": 500
    }

    response = requests.post(TOGETHER_API_URL, headers=headers, json=payload)
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]

    # Parse questions from response (supports numbered or bullet lists)
    lines = [line.strip("0123456789.-) ") for line in content.strip().split("\n") if line.strip()]
    questions = [line for line in lines if len(line.split()) > 3]  # Avoid short junk lines

    return questions
