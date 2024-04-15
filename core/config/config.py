from dotenv import load_dotenv, find_dotenv
from os import getenv

find_dotenv()
load_dotenv()

BOT_TOKEN = getenv("TELEGRAM_BOT_TOKEN")
SECRET_KEY = getenv("FERNET_KEY")
DB_URL = getenv("DB_URL")
