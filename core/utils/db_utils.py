from core.db.database import User
from core.utils.helpers import get_telegram_username
from core.encoder.chiper import Enigma
from core.moodle.moodleservice import Service


async def create_user(telegram_id: int, token: str):
    try:
        user_info = await Service.get_user_info(token)
        new_user = User(
            telegram_id=telegram_id,
            username=get_telegram_username(telegram_id),
            hashed_token=Enigma.encrypt(token),
            full_name=user_info.full_name,
            barcode=user_info.barcode,
            grades_notification=True,
            deadlines_notification=1,
            is_admin=False
        )
        new_user.save()
    except Exception as e:
        print(f"Error creating user: {str(e)}")

def delete_user(user_id):
    try:
        user = User.objects(telegram_id=user_id).first()
        if user:
            user.delete()
        else:
            print(f"User with telegram_id {user_id} not found.")
    except Exception as e:
        print(f"Error deleting user: {str(e)}")


