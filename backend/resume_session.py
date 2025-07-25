from fastapi import APIRouter, UploadFile, File, Form, Request
from resume_gpt_generator import generate_resume_questions
from evaluator import evaluate_with_gpt
from typing import Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os

# ✅ Initialize Firebase once
if not firebase_admin._apps:
    cred = credentials.Certificate("credentials/serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

router = APIRouter()

# 🧠 In-memory session storage
sessions: Dict[str, Dict[str, Any]] = {}

@router.post("/start-resume-session")
async def start_resume_session(user: str = Form(...), file: UploadFile = File(...)):
    contents = await file.read()
    try:
        questions = generate_resume_questions(contents)[:5]
    except Exception as e:
        return {"error": f"Failed to generate questions: {str(e)}"}

    sessions[user] = {
        "questions": questions,
        "index": 0,
        "answers": []
    }

    return {
        "message": "Session started",
        "question": questions[0]
    }

@router.post("/submit-resume-answer")
async def submit_resume_answer(request: Request):
    body = await request.json()
    user = body.get("user")
    answer = body.get("answer")

    if not user or not answer:
        return {"error": "Missing user or answer."}

    session = sessions.get(user)
    if not session:
        return {"error": "No active session found for this user."}

    index = session["index"]
    if index >= len(session["questions"]):
        return {"message": "Interview already completed."}

    question = session["questions"][index]

    try:
        # 🧠 Evaluate with GPT
        result = evaluate_with_gpt(question, answer)

        # 🔍 Parse response
        lines = [line.strip() for line in result.split("\n") if line.strip()]
        score_line = next((line for line in lines if "Score" in line), "")
        feedback_line = next((line for line in lines if "feedback" in line.lower()), "")
        correct_line = next((line for line in lines if "Correct" in line), "")

        feedback = f"{score_line}\n{feedback_line}".strip()
        correct_answer = correct_line.replace("Correct Answer:", "").strip()

        # ✅ Save to Firebase
        db.collection("resume_sessions").add({
            "user": user,
            "question": question,
            "answer": answer,
            "feedback": feedback,
            "correct_answer": correct_answer,
            "timestamp": datetime.utcnow()
        })

        # ✅ Store in session
        session["answers"].append({
            "question": question,
            "answer": answer,
            "feedback": feedback,
            "correct_answer": correct_answer
        })
        session["index"] += 1

        # ✅ Return next question or finish
        if session["index"] < len(session["questions"]):
            return {
                "feedback": feedback,
                "correct_answer": correct_answer,
                "next_question": session["questions"][session["index"]]
            }
        else:
            return {
                "feedback": feedback,
                "correct_answer": correct_answer,
                "message": "Interview complete."
            }

    except Exception as e:
        return {"error": f"Evaluation failed: {str(e)}"}

@router.get("/next-question")
async def next_question(user: str):
    session = sessions.get(user)
    if not session:
        return {"error": "No session found."}
    
    if session["index"] >= len(session["questions"]):
        return {"message": "Interview complete."}

    return {"question": session["questions"][session["index"]]}
@router.get("/get-sessions")
def get_user_sessions(user: str):
    db = firestore.client()
    sessions_ref = db.collection("interview_sessions").where("user", "==", user).order_by("timestamp", direction=firestore.Query.DESCENDING)
    sessions = [doc.to_dict() | {"id": doc.id} for doc in sessions_ref.stream()]
    return sessions