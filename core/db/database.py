import psycopg2
import dotenv
import os
from core.api.api import Api


class Database:
    # constructor takes data from env, creates connection
    def __init__(self):
        try:
            dotenv.load_dotenv()
            self.__host = os.getenv("DB_HOST")
            self.__port = os.getenv("DB_PORT")
            self.__user = os.getenv("DB_USER")
            self.__password = os.getenv("DB_PASSWORD")
            self.__db_name = os.getenv("DB_NAME")
            self.__api = Api()
            self.connection = None
            self.cursor = None
            await self.create_connection()
        except Exception as ex:
            print(f"[ERROR] Error while reading data from .env file\n{ex}")

    # create connection
    async def create_connection(self):
        try:
            self.connection = psycopg2.connect(
                host=self.__host,
                user=self.__user,
                password=self.__password,
                database=self.__db_name
            )
            self.connection.autocommit = True
        except Exception as ex:
            print(f"[ERROR] Error while connecting to postgresql db\n{ex}")

    # check if table exists
    async def table_exists(self, table_name: str):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select exists (select from pg_tables where tablename  = %s);", table_name)
                if "True" in cursor.fetchone():
                    return True
                return False
        except Exception as ex:
            print(f"[ERROR] Error while checking if tables exists\n{ex}")

    async def create_table_tokens(self):
        if self.table_exists("tokens"):
            print("[WARNING] Table tokens already exists")
            return
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    "create table tokens (id int primary key, token varchar(80), full_name varchar(80), barcode int);"
                )
                print("[SUCCESS] table tokens created")
        except Exception as ex:
            print(f"[ERROR] Error while creating table 'tokens'\n{ex}")

    async def create_table_notifications(self):
        if self.table_exists("notifications"):
            print("[WARNING] Table notifications already exists")
            return
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    "create table notifications ("
                    "id int primary key,"
                    "grades_notification int not null default 1,"
                    "deadlines_notification int not null default 1);"
                )
                print("[SUCCESS] Table notifications was created")
        except Exception as ex:
            print(f"[ERROR] Error while creating table notifications\n{ex}")

    async def drop_tables(self):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("drop table if exists tokens; drop table if exists notifications;")
            print("[SUCCESS] tables were dropped")
        except Exception as ex:
            print(f"[ERROR] Error while dropping tables\n{ex}")

    async def insert_token(self, user_id, token):
        try:
            user_info = self.__api.get_user_info(token)
            barcode = user_info['barcode']
            full_name = user_info['full_name']
            with self.connection.cursor() as cursor:
                cursor.execute("insert into tokens (id, token, full_name, barcode) values (%s, %s, %s, %s)",
                               [user_id, token, full_name, barcode])
                print(f"[SUCCESS] User {user_id} has been added to db with token {token}")
                # Запуск сохранения дедлайнов и оценокbarcode])
                await self.add_user_notifications(user_id)
        except Exception as ex:
            print(f"[ERROR] Couldn't add user {user_id} to the db\n{ex}")

    async def delete_token(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("delete from tokens where id = %s", [user_id])
                cursor.execute("delete from notifications where id = %s", [user_id])
        except Exception as ex:
            print(f"[ERROR] Couldn't delete User's {user_id} token\n{ex}")
            return None

    async def get_grade_notification(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(f"select grades_notification from notifications where id ={user_id}")
                return cursor.fetchone()[0]
        except Exception as ex:
            print(f"Couldn't get grade_notification settings from User {user_id}\n{ex}")
            return None

    async def get_deadline_notification(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(f"select deadlines_notification from notifications where id ={user_id}")
                return cursor.fetchone()[0]
        except Exception as ex:
            print(f"Couldn't get deadline_notification settings from User {user_id}\n{ex}")
            return None

    async def change_grade_notification(self, user_id, value):
        try:
            if value not in [0, 1]:
                raise ValueError(f"[VALUEERROR] Incorrect value for grades notification for User{user_id}")
            with self.connection.cursor() as cursor:
                cursor.execute("update notifications set grades_notification = %s where id = %s", (value, user_id))
        except Exception as ex:
            print(f"[ERROR] Couldn't change grades notification settings for User {user_id}\n{ex}")
            return None

    async def change_deadlines_notification(self, user_id, value):
        try:
            if value not in [1, 2, 3, 6, 12, 24, 36, 0]:
                raise ValueError(f"[VALUEERROR] Incorrect value for deadlines notification for User{user_id}")
            with self.connection.cursor() as cursor:
                cursor.execute("update notifications set deadlines_notification = %s where id = %s", (value, user_id))
        except Exception as ex:
            print(f"[ERROR] Couldn't change deadlines notification settings for User {user_id}\n{ex}")
            return None

    async def add_user_notifications(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("insert into notifications (id, grades_notification, deadlines_notification) "
                               "values (%s, %s, %s)", [user_id, 1, 1])
        except Exception as ex:
            print(f"[ERROR] Error while inserting User {user_id} in notifications table\n{ex}")
            return None

    async def update_token(self, user_id, token):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("update tokens set token = %s where id = %s", [token, user_id])
                print(f"[SUCCESS] User {user_id} has updated token to {token}")
        except Exception as ex:
            print(f"[ERROR] Couldn't update user {user_id} in the db\n{ex}")

    async def get_token(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select token from tokens where id = %s", [user_id])
                return cursor.fetchone()[0]
        except Exception as ex:
            print(f"[ERROR] Couldn't get token from User {user_id}\n{ex}")
            return None

    async def get_user(self, token):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select id from tokens where token = %s", [token])
                return cursor.fetchone()[0]
        except Exception as ex:
            print(f"[ERROR] Couldn't get user_id from Token {token}\n{ex}")
            return None

    async def get_barcode(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select barcode from tokens where id = %s", [user_id])
                return cursor.fetchone()[0]
        except Exception as ex:
            print(ex)
            return None

    async def get_full_name(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select full_name from tokens where id = %s", [user_id])
                return cursor.fetchone()[0]
        except Exception as ex:
            print(ex)
            return None

    async def user_exists(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select * from tokens where id = %s", [user_id])
                return cursor.fetchone() is not None
        except Exception as ex:
            print(f"[ERROR] Error while checking db with user {user_id}\n{ex}")
            return None

    async def has_token(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select token from tokens where id = %s", [user_id])
                if cursor.fetchone() is not None:
                    return True
                else:
                    return False
        except Exception as ex:
            print(f"[ERROR] Error while checking db with user {user_id}\n{ex}")
            return None
