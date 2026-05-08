import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

try:
    client = MongoClient(MONGODB_URI)
    db = client.get_database("innovascope") # Ensure database is innovascope
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    db = None

# Export collections
users_col = db["users"] if db is not None else None
dashboards_col = db["dashboards"] if db is not None else None
queues_col = db["queues"] if db is not None else None
history_col = db["history"] if db is not None else None
