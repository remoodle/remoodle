import dotenv
import os
from cryptography.fernet import Fernet


class Enigma:
    @staticmethod
    def encrypt(password: str):
        dotenv.load_dotenv()
        key = os.getenv("FERNET_KEY")
        f = Fernet(key)
        return f.encrypt(password.encode()).decode()

    @staticmethod
    def decrypt(encrypted_password: str):
        dotenv.load_dotenv()
        key = os.getenv("FERNET_KEY")
        f = Fernet(key)
        return f.decrypt(encrypted_password.encode()).decode()


print(Enigma.decrypt(Enigma.encrypt("Sanya loh")))
