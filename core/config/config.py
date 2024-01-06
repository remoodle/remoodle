from dotenv import load_dotenv, find_dotenv
from os import getenv

find_dotenv()
load_dotenv()

DB_NAME = getenv("DB_NAME")
DB_USER = getenv("DB_USER")
DB_PASS = getenv("DB_PASS")
BOT_TOKEN = getenv("BOT_TOKEN")
DB_HOST = getenv("DB_HOST")
SECRET_KEY = getenv("FERNET_KEY")

