from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

# Get Mongo URI
MONGO_URI = os.getenv("MONGO_URI")

print("Mongo URI:", MONGO_URI)

# Connect MongoDB
client = MongoClient(MONGO_URI)

# Database
db = client["mindmate_ai"]

# Collections
users_collection = db["users"]
chat_collection = db["chat_history"]
emotion_collection = db["emotion_history"]

print("✅ MongoDB Connected Successfully")