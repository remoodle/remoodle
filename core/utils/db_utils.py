from core.db.database import User
from core.utils.helpers import get_telegram_username
from core.encoder.chiper import Enigma
from core.moodle.moodleservice import Service


def create_user(
        telegram_id: int,
        token: str
):
    user = await Service.get_user_info(token)
    new_user = User(
        telegram_id=telegram_id,
        username=get_telegram_username(telegram_id),
        hashed_token=Enigma.encrypt(token),
        full_name=user.full_name,
        barcode=user.barcode,
        grades_notification=True,
        deadlines_notification=1,
        is_admin=False
    )
    new_user.save()
