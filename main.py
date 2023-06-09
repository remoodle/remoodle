from aiogram import *
import logging
import asyncio
import dotenv
import os
from core.api.api import Api
from core.db.database import Database
from core.handlers.notification_handlers.grade_notification_handler import start_loop
from core.handlers.user_handlers import user_handlers

db = Database()
api = Api()
dotenv.load_dotenv()
token = os.getenv("TOKEN")
bot = Bot(token, parse_mode="HTML")


async def main():
    await db.create_connection()
    await db.clear_tables()

    dp = Dispatcher()

    print("Bot started!")
    dp.include_routers(user_handlers.router)
    await dp.start_polling(bot)

if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    asyncio.ensure_future(main())
    asyncio.ensure_future(start_loop(bot))
    asyncio.get_event_loop().run_forever()
