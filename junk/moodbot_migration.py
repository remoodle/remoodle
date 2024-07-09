import os
import time
import uuid
import json
import argparse
from datetime import datetime
from cryptography.fernet import Fernet  # type: ignore

MOODBOT_BD = "./input/moodbot.user.json"


def decrypt_token(secret_key, encrypted_token):
    f = Fernet(secret_key)
    return f.decrypt(encrypted_token.encode()).decode()


def migrate_data(secret_key):
    with open(MOODBOT_BD, "r") as file:
        users = json.load(file)

    timestamp = str(int(time.time()))
    output_dir = f"./output/{timestamp}"
    os.makedirs(output_dir, exist_ok=True)

    json_output_path = os.path.join(output_dir, "remoodle.users.json")
    core_output_path = os.path.join(output_dir, "remoodle_aitu.sql")

    json_output = []
    sql_statements = []

    for user in users:
        new_user_id = str(uuid.uuid4())
        new_user = {
            "_id": new_user_id,
            "telegramId": user.get("telegram_id"),
            "moodleId": user.get("moodle_id"),
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z",
            "__v": 0,
            "name": user.get("full_name"),
        }

        json_output.append(new_user)

        moodle_token = decrypt_token(secret_key, str(user.get("hashed_token")))

        """
        moodle_id: int
        username: str
        name: srt
        moodle_token: sty
        initialized: 0

        notify_method: get_update
        webhook: NULL
        webhook_secret: NULL 
        grades_notification: 0
        deadlines_notification: 0
        password_hash: NULL
        name_alias: NULL
        """

        mysql_insert_query = f"""
INSERT INTO moodle_users (moodle_id, username, name, moodle_token, initialized, notify_method, grades_notification, deadlines_notification)
VALUES ('{user.get("moodle_id")}', '{user.get("username")}', '{user.get("full_name")}', '{moodle_token}', 1, 'get_update', {int(user.get("grades_notification"))}, '{user.get("deadlines_notification")}');
        """
        sql_statements.append(mysql_insert_query)

    with open(json_output_path, "w") as json_file:
        json.dump(json_output, json_file, indent=4)

    with open(core_output_path, "w") as sql_file:
        for statement in sql_statements:
            sql_file.write(statement + "\n")

    print(f"Files are written in the directory: {output_dir}")


def main():
    parser = argparse.ArgumentParser(
        description="Data migration tool with encryption support."
    )
    parser.add_argument(
        "secret_key", type=str, help="The secret key for Fernet encryption/decryption."
    )
    args = parser.parse_args()

    migrate_data(args.secret_key)


if __name__ == "__main__":
    main()
