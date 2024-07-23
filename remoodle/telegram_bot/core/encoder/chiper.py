from core.config.config import SECRET_KEY
from cryptography.fernet import Fernet


class Enigma:
    @staticmethod
    def encrypt(password: str):
        f = Fernet(SECRET_KEY)
        return f.encrypt(password.encode()).decode()

    @staticmethod
    def decrypt(encrypted_password: str):
        f = Fernet(SECRET_KEY)
        return f.decrypt(encrypted_password.encode()).decode()
