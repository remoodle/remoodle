from core.db.database import User
from core.utils.helpers import get_telegram_username
from core.encoder.chiper import Enigma
from core.moodle.moodleservice import Service


async def create_user(telegram_id: int, token: str):
    try:
        username = await get_telegram_username(telegram_id)
        user_info = await Service.get_user_info(token)
        if not user_info:
            raise Exception
        new_user = User(
            telegram_id=telegram_id,
            username=username,
            hashed_token=Enigma.encrypt(token),
            full_name=user_info['full_name'],
            barcode=user_info['barcode'],
        )
        new_user.save()
    except Exception as e:
        print(f"Error creating user: {str(e)}")

async def delete_user(user_id):
    try:
        user = User.objects(telegram_id=user_id).first()
        if user:
            user.delete()
        else:
            print(f"User with telegram_id {user_id} not found.")
    except Exception as e:
        print(f"Error deleting user: {str(e)}")

async def is_registered(user_id):
    try:
        user = User.objects(telegram_id=user_id).first()
        if user is None:
            return True
        else:
            return False
    except Exception as e:
        print(f"Something went wrong while checking registration state of {user_id}")


