import psycopg2
import dotenv
import os
from core.api.api import Api

dotenv.load_dotenv()


class Database:
    # constructor takes data from env, creates connection
    def __init__(self):
        try:
            self.__host = os.getenv("DB_HOST")
            self.__port = os.getenv("DB_PORT")
            self.__user = os.getenv("DB_USER")
            self.__password = os.getenv("DB_PASSWORD")
            self.__db_name = os.getenv("DB_NAME")
            self.__api = Api()
            self.connection = None
            self.cursor = None
            self.create_connection()
        except Exception as ex:
            print(f"[ERROR] Error while reading data from .env file\n{ex}")

    # create connection
    def create_connection(self):
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
    def table_exists(self):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select exists (select from pg_tables where tablename  = 'tokens');")
                if "True" in cursor.fetchone():
                    return True
                return False
        except Exception as ex:
            print(f"[ERROR] Error while checking if tables exists\n{ex}")

    def create_tables(self):
        if self.table_exists():
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

    def drop_tables(self):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("drop table if exists tokens")
            print("[SUCCESS] table tokens has dropped")
        except Exception as ex:
            print(f"[ERROR] Error while dropping table 'tokens'\n{ex}")

    def insert_token(self, user_id, token):
        try:
            user_info = self.__api.get_user_info(token)
            barcode = user_info['username'].split('@')[0]
            full_name = user_info['full_name']
            with self.connection.cursor() as cursor:
                cursor.execute("insert into tokens (id, token, full_name, barcode) values (%s, %s, %s, %s)",
                               [user_id, token, full_name, barcode])
                print(f"[SUCCESS] User {user_id} has been added to db with token {token}")
        except Exception as ex:
            print(f"[ERROR] Couldn't add user {user_id} to the db\n{ex}")

    def update_token(self, user_id, token):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("update tokens set token = %s where id = %s", [token, user_id])
                print(f"[SUCCESS] User {user_id} has updated token to {token}")
        except Exception as ex:
            print(f"[ERROR] Couldn't update user {user_id} in the db\n{ex}")

    def get_token(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select token from tokens where id = %s", [user_id])
                return cursor.fetchone()[0]
        except Exception as ex:
            print(f"[ERROR] Couldn't get token from User {user_id}\n{ex}")
            return None

    def get_user(self, token):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select id from tokens where token = %s", [token])
                return cursor.fetchone()[0]
        except Exception as ex:
            print(f"[ERROR] Couldn't get user_id from Token {token}\n{ex}")
            return None

    def get_barcode(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select barcode from tokens where id = %s", [user_id])
                return cursor.fetchone()[0]
        except Exception as ex:
            print(ex)
            return None

    def get_full_name(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select full_name from tokens where id = %s", [user_id])
                return cursor.fetchone()[0]
        except Exception as ex:
            print(ex)
            return None

    def user_exists(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select * from tokens where id = %s", [user_id])
                return cursor.fetchone() is not None
        except Exception as ex:
            print(f"[ERROR] Error while checking db with user {user_id}\n{ex}")
            return None

    def has_token(self, user_id):
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
