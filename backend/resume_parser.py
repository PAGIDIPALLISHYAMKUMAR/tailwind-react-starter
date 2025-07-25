from fastapi import APIRouter, UploadFile, File
from resume_gpt_generator import generate_resume_questions

router = APIRouter()

@router.post("/generate-questions-from-resume")
async def generate_questions_from_resume(file: UploadFile = File(...)):
    try:
        # ✅ Read uploaded PDF resume as bytes
        contents = await file.read()

        # ✅ Directly pass bytes to resume_gpt_generator
        questions = generate_resume_questions(contents)

        return {"questions": questions}

    except Exception as e:
        print("❌ Resume parsing/generation error:", str(e))
        return {"error": "Failed to generate questions from resume."}
