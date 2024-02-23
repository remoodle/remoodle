from core.config.config import DB_NAME, DB_USER, DB_PASS, DB_HOST
from mongoengine import *
print(DB_HOST)
connect(host=f'mongodb+srv://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}')

class User(Document):
    telegram_id = IntField(required=True)
    username = StringField(required=True)
    hashed_token = StringField(required=True)
    full_name = StringField(required=True)
    moodle_id = IntField(required=True)
    barcode = IntField(required=True)
    grades_notification = BooleanField(default=True)
    deadlines_notification = IntField(default=1)
    is_admin = BooleanField(default=False)

