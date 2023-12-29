from core.db.database import Database
import asyncio
from core.utils.helpers import create_telegram_chat_id_username_relation


db = Database()


async def temp():
    await db.create_connection()
    await db.create_table_telegram()
    await create_telegram_chat_id_username_relation()

asyncio.run(temp())

