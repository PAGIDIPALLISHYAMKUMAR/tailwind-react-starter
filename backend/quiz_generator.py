from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"

class QuizRequest(BaseModel):
    topic: str

@router.post("/generate-quiz")
def generate_quiz(req: QuizRequest):
    prompt = f"""
Generate 10 multiple-choice questions (MCQs) for the topic "{req.topic}".
Some questions should have multiple correct answers.

Return each question as a JSON object with:
- question: string
- options: list of 4 strings
- correct_answer: list of correct options (1 or more)

Return the data as a JSON list only. Do not include markdown (```) or explanations.
Example:
[
  {{
    "question": "Which of the following are CI/CD tools?",
    "options": ["Jenkins", "Docker", "Photoshop", "GitHub Actions"],
    "correct_answer": ["Jenkins", "GitHub Actions"]
  }},
  ...
]
"""

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "messages": [
            {"role": "system", "content": "You are an expert DevOps quiz generator."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1500,
    }

    try:
        res = requests.post(TOGETHER_API_URL, headers=headers, json=payload)
        res.raise_for_status()
        text = res.json()["choices"][0]["message"]["content"]
        print("🔍 GPT Raw Response:\n", text)

        # ---- CLEANING GPT RESPONSE ----
        import json, re

        # Strip markdown or extra code wrappers
        cleaned = re.sub(r"^```(json)?", "", text.strip())
        cleaned = re.sub(r"```$", "", cleaned)
        cleaned = cleaned.replace("\\_", "_")
        cleaned = cleaned.replace("’", "'").replace("“", '"').replace("”", '"')

        # Strip non-JSON prefix/suffix if accidentally added
        json_start = cleaned.find("[")
        json_end = cleaned.rfind("]")
        if json_start == -1 or json_end == -1:
            raise ValueError("No valid JSON array found in response.")

        cleaned_json = cleaned[json_start : json_end + 1]

        # Parse to Python object
        quiz_data = json.loads(cleaned_json)

        # Validate structure (basic)
        if not isinstance(quiz_data, list):
            raise ValueError("Parsed data is not a list.")

        return quiz_data

    except Exception as e:
        print(f"❌ Quiz generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {e}")
