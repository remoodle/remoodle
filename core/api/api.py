import requests


class Api:
    __api_link = "http://127.0.0.1:8000/api/"

    def get_user_info(self, token):
        response = requests.get(self.__api_link + f"{token}/get-user-info")
        return response.json()

    def get_user_courses(self, token):
        response = requests.get(self.__api_link + f"{token}/get-user-courses")
        return response.json()

    def get_user_relative_courses(self, token):
        response = requests.get(self.__api_link + f"{token}/get-user-relative-courses")
        return response.json()

    def update_course_modules(self, token, course_id):
        response = requests.get(self.__api_link + f"{token}/course/{course_id}/updateModules")
        return response.json()

    def get_course_by_id(self, token, course_id):
        response = requests.get(self.__api_link + f"{token}/course/{course_id}")
        return response.json()

    def get_course_grade(self, token, course_id):
        response = requests.get(self.__api_link + f"{token}/course/{course_id}/get-grade")
        return response.json()

    def get_course_contents(self, token, course_id):
        response = requests.get(self.__api_link + f"{token}/course/{course_id}/get-contents")
        return response.json()

    def get_course_assignments(self, token, course_id):
        response = requests.get(self.__api_link + f"{token}/course/{course_id}/get-assignments")
        return response.json()

    # t.b.c. get_updates()
