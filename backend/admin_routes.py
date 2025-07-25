from fastapi import APIRouter, Depends, HTTPException, Header
from firebase_admin import firestore, auth as admin_auth
from typing import Optional
import requests
import os

router = APIRouter()

# ✅ Verify Firebase token from Authorization header
def verify_firebase_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    id_token = authorization.split("Bearer ")[1]
    try:
        decoded_token = admin_auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# 🔍 Check if user is admin
@router.get("/admin/check")
def check_if_admin(user=Depends(verify_firebase_token)):
    db = firestore.client()
    doc = db.collection("users").document(user["email"]).get()
    return {"is_admin": doc.exists and doc.to_dict().get("isAdmin", False)}

# 📋 List all users (admin-only)
@router.get("/admin/users")
def list_users(user=Depends(verify_firebase_token)):
    db = firestore.client()
    requester_doc = db.collection("users").document(user["email"]).get()
    if not requester_doc.exists or not requester_doc.to_dict().get("isAdmin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    users_ref = db.collection("users").stream()
    return [{"email": u.id, "isAdmin": u.to_dict().get("isAdmin", False)} for u in users_ref]

# 🔄 Toggle admin status
@router.post("/admin/toggle-admin")
def toggle_admin(payload: dict, user=Depends(verify_firebase_token)):
    db = firestore.client()
    requester_doc = db.collection("users").document(user["email"]).get()
    if not requester_doc.exists or not requester_doc.to_dict().get("isAdmin"):
        raise HTTPException(status_code=403, detail="Admin rights required.")

    email = payload.get("email")
    is_admin = payload.get("isAdmin", False)

    if not email:
        raise HTTPException(status_code=400, detail="Missing email.")

    db.collection("users").document(email).set({"isAdmin": is_admin}, merge=True)
    return {"message": f"Admin status for {email} updated to {is_admin}."}

# 🆕 Create new user + send password reset
@router.post("/admin/create-user")
def create_user(payload: dict, user=Depends(verify_firebase_token)):
    db = firestore.client()
    FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")

    if not FIREBASE_API_KEY:
        raise HTTPException(status_code=500, detail="Missing FIREBASE_API_KEY in environment.")

    requester_doc = db.collection("users").document(user["email"]).get()
    if not requester_doc.exists or not requester_doc.to_dict().get("isAdmin"):
        raise HTTPException(status_code=403, detail="Admin rights required.")

    email = payload.get("email")
    password = payload.get("password")
    is_admin = payload.get("isAdmin", False)

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    try:
        admin_auth.get_user_by_email(email)
        raise HTTPException(status_code=400, detail="User already exists.")
    except admin_auth.UserNotFoundError:
        pass

    new_user = admin_auth.create_user(
        email=email,
        password=password,
        email_verified=True
    )

    db.collection("users").document(email).set({
        "isAdmin": is_admin,
        "emailVerified": True,
        "createdAt": firestore.SERVER_TIMESTAMP,
    })

    reset_url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={FIREBASE_API_KEY}"
    reset_payload = {
        "requestType": "PASSWORD_RESET",
        "email": email
    }

    reset_res = requests.post(reset_url, json=reset_payload)
    if reset_res.status_code != 200:
        raise HTTPException(status_code=500, detail="User created, but failed to send password reset email.")

    return {"message": f"✅ User {email} created and password reset email sent."}

# ❌ Delete user (Firebase Auth + Firestore)
@router.delete("/admin/delete-user")
def delete_user(payload: dict, user=Depends(verify_firebase_token)):
    db = firestore.client()
    email_to_delete = payload.get("email")

    requester_doc = db.collection("users").document(user["email"]).get()
    if not requester_doc.exists or not requester_doc.to_dict().get("isAdmin"):
        raise HTTPException(status_code=403, detail="Admin rights required.")

    if not email_to_delete:
        raise HTTPException(status_code=400, detail="Missing email.")

    try:
        # Delete from Firebase Auth
        user_record = admin_auth.get_user_by_email(email_to_delete)
        admin_auth.delete_user(user_record.uid)

        # Delete from Firestore
        db.collection("users").document(email_to_delete).delete()

        return {"message": f"✅ User {email_to_delete} deleted successfully."}
    except admin_auth.UserNotFoundError:
        return {"message": "⚠️ User not found in Firebase Auth."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Failed to delete user: {str(e)}")
