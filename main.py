from aiogram import *
import logging
import asyncio
import dotenv
import os

from core.api.api import Api
from core.db.database import Database
from core.utils import helpers
from core.handlers.user_handlers import user_handlers

db = Database()
api = Api()


async def main():
    dotenv.load_dotenv()
    token = os.getenv("TOKEN")

    dp = Dispatcher()

    bot = Bot(token, parse_mode="HTML")
    print("Bot started!")
    dp.include_routers(user_handlers.router)
    await dp.start_polling(bot)


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    asyncio.run(main())
