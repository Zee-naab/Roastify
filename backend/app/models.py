import datetime
import random
import string

import bcrypt
import pymongo
from bson import ObjectId

from app import mongo


def setup_indexes():
    """
    Sets up required MongoDB indexes for performance, particularly
    for fetching conversation history quickly.
    """
    if mongo.db is not None:
        mongo.db.messages.create_index(
            [("conversation_id", pymongo.ASCENDING), ("timestamp", pymongo.ASCENDING)]
        )
        mongo.db.messages.create_index(
            [("conversation_id", pymongo.ASCENDING), ("_id", pymongo.ASCENDING)]
        )


def prune_messages(conversation_id, keep=10):
    """
    Keeps only the most recent `keep` messages for a given conversation_id.
    Deletes all older messages beyond that limit.
    Called after every AI response is saved so the collection never bloats.
    Returns the number of documents deleted (0 if nothing needed pruning).
    """
    if mongo.db is None:
        return 0

    messages_col = mongo.db.messages

    # Grab _id of the `keep` most-recent messages (newest first)
    recent = list(
        messages_col.find({"conversation_id": conversation_id}, {"_id": 1})
        .sort("timestamp", pymongo.DESCENDING)
        .limit(keep)
    )

    # Not enough messages to warrant pruning yet
    if len(recent) < keep:
        return 0

    keep_ids = [doc["_id"] for doc in recent]

    # Delete everything that is NOT in the keep list
    result = messages_col.delete_many(
        {"conversation_id": conversation_id, "_id": {"$nin": keep_ids}}
    )

    deleted = result.deleted_count
    if deleted:
        print(
            f"[prune] Removed {deleted} old message(s) from conversation {conversation_id}"
        )

    return deleted


def create_user(email, password):
    """
    Creates a new user with a hashed password if the email doesn't exist.
    Returns the inserted user's _id or None if user exists.
    """
    users_col = mongo.db.users

    # Check if user already exists
    existing_user = users_col.find_one({"email": email})
    if existing_user:
        return None

    # Hash the password
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), salt)

    user_doc = {
        "email": email,
        "password": hashed_pw,  # store bytes or decode to string depending on preference
        "created_at": datetime.datetime.utcnow(),
        "is_verified": False,
    }

    result = users_col.insert_one(user_doc)
    return result.inserted_id


def verify_password(email, password):
    """
    Looks up a user by email and verifies the provided password
    against the stored bcrypt hash. Returns True/False.
    """
    users_col = mongo.db.users
    user = users_col.find_one({"email": email})

    if not user or "password" not in user:
        return False

    stored_hash = user["password"]
    if isinstance(stored_hash, str):
        stored_hash = stored_hash.encode("utf-8")

    try:
        return bcrypt.checkpw(password.encode("utf-8"), stored_hash)
    except ValueError:
        # In case the stored hash is malformed for any reason
        return False


def create_otp(email):
    """
    Generates a 6-digit OTP, stores it with a 5-minute expiration, via UPSERT.
    Returns the generated OTP string.
    """
    otps_col = mongo.db.otps

    # Generate 6 digit code
    # Using secrets or random choice for numbers
    otp_code = "".join(random.choices(string.digits, k=6))

    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)

    # Upsert the OTP so we don't have multiple active OTPs for the same email clogging the DB
    otps_col.update_one(
        {"email": email},
        {"$set": {"otp": otp_code, "expires_at": expires_at}},
        upsert=True,
    )

    return otp_code


def verify_user_otp(email, code):
    """
    Checks if the provided code matches the one in the DB and is not expired.
    If valid, marks the user as verified and deletes the OTP prompt.
    Returns True if successful, False otherwise.
    """
    otps_col = mongo.db.otps
    users_col = mongo.db.users

    # Find OTP
    otp_doc = otps_col.find_one({"email": email, "otp": code})

    if not otp_doc:
        return False

    # Check Expiry
    if datetime.datetime.utcnow() > otp_doc["expires_at"]:
        # Too late
        return False

    # Valid! Update user to verified
    users_col.update_one({"email": email}, {"$set": {"is_verified": True}})

    # Clean up the OTP document
    otps_col.delete_one({"_id": otp_doc["_id"]})

    return True
