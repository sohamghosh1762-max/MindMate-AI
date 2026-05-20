from database.db import users_collection
from datetime import datetime

def create_user(name, email, password):

    user_data = {

        "name": name,

        "email": email,

        "password": password,

        "created_at": datetime.utcnow()
    }

    result = users_collection.insert_one(user_data)

    return str(result.inserted_id)

def find_user_by_email(email):

    return users_collection.find_one({
        "email": email
    })