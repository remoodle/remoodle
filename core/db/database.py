import asyncio
import logging
import psycopg2
import dotenv
import os
from core.api.api import Api
import time

dotenv.load_dotenv()


class Database:
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

    async def get_grades_difference(self, user_id) -> list:
        api = Api()
        token = await self.get_token(user_id)

        updated_grades = []

        await self.create_connection()

        try:
            relative_courses = await api.get_user_relative_courses(token)
            moodle_grades = []
            for course in relative_courses:
                assignments = await api.get_course_grades(token, course['id'])
                for assignment in assignments:
                    try:
                        assignment['grade'] = round(float(assignment['grade']), 2)
                    except Exception as ex:
                        assignment['grade'] = -1

                    moodle_grades.append({
                        "user_id": user_id,
                        "course_id": assignment['course_id'],
                        "assignment_id": assignment['id'],
                        "assignment_name": assignment['name'],
                        "grade": round(float(assignment['grade']), 2)
                    })

            for moodle_grade in moodle_grades:
                with self.connection.cursor() as cursor:
                    cursor.execute("select grade from grades where user_id = %s and assignment_id = %s",
                                   [user_id, moodle_grade['assignment_id']])
                    current_grade = round(float(cursor.fetchone()[0]), 2)

                    if current_grade is not None and moodle_grade['grade'] != current_grade:
                        course_info = dict(await api.get_course(token, moodle_grade['course_id']))
                        course_name = str(course_info['name']).split('|')[0]
                        course_teacher = str(course_info['name']).split('|')[1]
                        assignment_id = moodle_grade['assignment_id']
                        assignment_name = await self.get_assignment_name_by_id(assignment_id)
                        old_grade = current_grade
                        new_grade = moodle_grade['grade']
                        await self.insert_user_new_assignment_grade(user_id, moodle_grade['course_id'],
                                                                    assignment_id, moodle_grade['grade'])
                        updated_grades.append({
                            "user_id": user_id,
                            "course_id": moodle_grade['course_id'],
                            "course_name": course_name,
                            "course_teacher": course_teacher,
                            "assignment_id": assignment_id,
                            "assignment_name": assignment_name,
                            "old_grade": old_grade,
                            "new_grade": new_grade
                        })
                    elif current_grade is None:
                        try:
                            grade = round(float(moodle_grade['grade']), 2)
                        except Exception as ex:
                            grade = -1

                        if grade > 0:
                            course_info = dict(await api.get_course(token, moodle_grade['course_id']))
                            updated_grades.append({
                                "user_id": user_id,
                                "course_id": moodle_grade['course_id'],
                                "course_name": str(course_info['name']).split('|')[0],
                                "course_teacher": str(course_info['name']).split('|')[1],
                                "assignment_id": moodle_grade['assignment_id'],
                                "assignment_name": moodle_grade['assignment_name'],
                                "old_grade": -1,
                                "new_grade": grade
                            })
                        await self.add_assignment_to_grades(user_id, moodle_grade['course_id'],
                                                            moodle_grade['assignment_id'],
                                                            moodle_grade['assignment_name'],
                                                            grade)

            print(updated_grades)
            return updated_grades

        except Exception as ex:
            print(f"[ERROR] Error while getting grades difference of User {user_id}\n{ex}")

    async def add_assignment_to_grades(self, user_id, course_id, assignment_id, assignment_name, grade):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("insert into grades (user_id, course_id, assignment_id, assignment_name, grade)"
                               "values (%s, %s, %s, %s, %s)",
                               [user_id, course_id, assignment_id, assignment_name, grade])
        except Exception as ex:
            return None

    async def get_assignment_name_by_id(self, assignment_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select distinct assignment_name from grades where assignment_id = %s", [assignment_id])
                return cursor.fetchone()[0]
        except Exception as ex:
            print("[ERROR] Couldn't get assignemnt name from assignment id " + str(assignment_id))

    async def get_all_user_ids(self):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select id from tokens")
                answer = []
                user_ids = cursor.fetchall()
                for user in user_ids:
                    if await self.get_grade_notification(user) == 1:
                        answer.append(user[0])

                return answer
        except Exception as ex:
            print(f"[ERROR] Error while getting all users from db\n{ex}")

    async def insert_user_new_assignment_grade(self, user_id, course_id, assignment_id, new_grade):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("update grades set grade = %s where user_id = %s and "
                               "course_id = %s and assignment_id = %s", [new_grade, user_id, course_id, assignment_id])
        except Exception as ex:
            print(f"[ERROR] Error while inserting user's grade to db\n{ex}")

    async def insert_user_relative_courses_grades(self, user_id):
        start = time.time()
        api = Api()
        token = await self.get_token(user_id)
        relative_courses = await api.get_user_relative_courses(token)

        if len(relative_courses) == 0:
            return

        try:
            with self.connection.cursor() as cursor:
                for course in relative_courses:
                    assignments = await api.get_course_grades(token, course['id'])
                    for assignment in assignments:
                        try:
                            assignment['grade'] = float(assignment['grade'])
                        except Exception:
                            assignment['grade'] = -1
                        cursor.execute("insert into grades (user_id, course_id, assignment_id, assignment_name, grade) "
                                       "values (%s, %s, %s, %s, %s)",
                                       (user_id, assignment['course_id'], assignment['id'], assignment['name'],
                                        round(assignment['grade'], 2)))
                end = time.time()
                print("User " + str(user_id) + " " + str(end - start))
        except Exception as ex:
            print(f"[ERROR] Error while inserting grades of User {user_id}\n{ex}")

    async def table_exists(self, table_name: str):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select exists (select from pg_tables where tablename  = %s);", table_name)
                if "True" in cursor.fetchone():
                    return True
                return False
        except Exception as ex:
            print(f"[ERROR] Error while checking if tables exists\n{ex}")

    async def create_tables(self):
        await self.create_table_tokens()
        await self.create_table_notifications()
        await self.create_table_grades()

    async def create_table_tokens(self):
        if await self.table_exists("tokens"):
            print("[WARNING] Table tokens already exists")
            return
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    "create table tokens (id bigint primary key, token varchar(80), full_name varchar(80), barcode int);"
                )
                print("[SUCCESS] table tokens created")
        except Exception as ex:
            print(f"[ERROR] Error while creating table 'tokens'\n{ex}")

    async def create_table_notifications(self):
        if await self.table_exists("notifications"):
            print("[WARNING] Table notifications already exists")
            return
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    "create table notifications ("
                    "id bigint primary key,"
                    "grades_notification int not null default 1,"
                    "deadlines_notification int not null default 1);"
                )
                print("[SUCCESS] Table notifications was created")
        except Exception as ex:
            print(f"[ERROR] Error while creating table notifications\n{ex}")

    async def create_table_grades(self):
        if await self.table_exists("grades"):
            print("[WARNING] Table grades already exists")
            return
        try:

            with self.connection.cursor() as cursor:
                cursor.execute(
                    "create table grades ("
                    "user_id bigint references tokens(id),"
                    "course_id int,"
                    "assignment_id int,"
                    "assignment_name varchar(120),"
                    "grade numeric(5,2));"
                )
                print("[SUCCESS] Table grades was created")
        except Exception as ex:
            print(f"[ERROR] Error while creating table grades\n{ex}")

    async def drop_tables(self):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("drop table if exists tokens; "
                               "drop table if exists notifications;"
                               "drop table if exists grades;")
            print("[SUCCESS] tables were dropped")
        except Exception as ex:
            print(f"[ERROR] Error while dropping tables\n{ex}")

    async def clear_tables(self):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("delete from grades;")
                cursor.execute("delete from notifications;")
                cursor.execute("delete from tokens;")
            print("[SUCCESS] tables were cleared")
        except Exception as ex:
            print(f"[ERROR] Error while dropping tables\n{ex}")

    async def insert_token(self, user_id, token):
        try:
            user_info = await self.__api.get_user_info(token)
            barcode = user_info['barcode']
            full_name = user_info['full_name']
            with self.connection.cursor() as cursor:
                cursor.execute("insert into tokens (id, token, full_name, barcode) values (%s, %s, %s, %s)",
                               [user_id, token, full_name, barcode])
                print(f"[SUCCESS] User {user_id} has been added to db with token {token}")
                # Запуск сохранения дедлайнов и оценокbarcode])
                await self.add_user_notifications(user_id)
                await self.insert_user_relative_courses_grades(user_id)
        except Exception as ex:
            print(f"[ERROR] Couldn't add user {user_id} to the db\n{ex}")

    async def delete_token(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("delete from grades where user_id = %s", [user_id])
                cursor.execute("delete from tokens where id = %s;", [user_id])
                cursor.execute("delete from notifications where id = %s;", [user_id])
        except Exception as ex:
            print(f"[ERROR] Couldn't delete User's {user_id} token\n{ex}")
            return None

    async def get_grade_notification(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(f"select grades_notification from notifications where id = %s", [user_id])
                return cursor.fetchone()[0]
        except Exception as ex:
            print(f"Couldn't get grade_notification settings from User {user_id}\n{ex}")
            return None

    async def get_deadline_notification(self, user_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("select deadlines_notification from notifications where id = %s", [user_id])
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