from core.config.config import DB_NAME, DB_USER, DB_PASS, DB_HOST
from mongoengine import *

connect(host=f'mongodb+srv://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}')

class User(Document):
    telegram_id = IntField(required=True)
    username = StringField(required=True)
    hashed_token = StringField(required=True)
    full_name = StringField(required=True)
    barcode = IntField(required=True)
    grades_notification = BooleanField(default=True)
    deadlines_notification = IntField(default=0)

