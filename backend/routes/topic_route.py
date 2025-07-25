from fastapi import APIRouter, Request
from topic_question_generator import generate_questions_by_topic

router = APIRouter()

@router.post("/generate-topic-questions")
async def generate_topic_questions(request: Request):
    body = await request.json()
    topic = body.get("topic")
    difficulty = body.get("difficulty")

    if not topic or not difficulty:
        return {"error": "Topic and difficulty are required."}

    try:
        questions = generate_questions_by_topic(topic, difficulty)
        return {"questions": questions}
    except Exception as e:
        return {"error": f"Failed to generate questions: {str(e)}"}
