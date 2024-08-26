from core.config.config import DB_URL
from mongoengine import *

connect(host=DB_URL)

class User(Document):
    telegram_id = IntField(required=True)
    username = StringField(required=True)
    hashed_token = StringField(required=True)
    full_name = StringField(required=True)
    moodle_id = IntField(required=True)
    barcode = IntField(required=True)
    grades = DictField()
    grades_notification = BooleanField(default=True)
    deadlines_notification = IntField(default=1)
    is_admin = BooleanField(default=False)

