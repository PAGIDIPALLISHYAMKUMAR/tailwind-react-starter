from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from evaluator import router as evaluator_router
from dotenv import load_dotenv
from resume_parser import router as resume_router
from resume_parser import router as resume_parser_router
from resume_session import router as session_router
from resume_session import router as resume_router
from routes.topic_route import router as topic_router
from topic_question import router as topic_router
from topic_question import router as topic_question_router
from topic_evaluate import router as topic_eval_router
from resume_review import router as resume_review_router
from admin_routes import router as admin_router
from quiz_generator import router as quiz_router





# ✅ Load environment variables from .env
load_dotenv()

app = FastAPI()

# ✅ Allow frontend to call the backend locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev. Restrict in prod!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Mount the evaluator route (e.g., /evaluate-answer)
app.include_router(evaluator_router)
app.include_router(resume_router)
app.include_router(resume_parser_router)
app.include_router(session_router)
app.include_router(resume_router)
app.include_router(topic_router)
app.include_router(topic_router)
app.include_router(topic_question_router)
app.include_router(topic_eval_router)
app.include_router(resume_review_router)
app.include_router(admin_router)
app.include_router(quiz_router)
