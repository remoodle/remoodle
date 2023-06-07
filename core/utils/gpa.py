from core.api.api import Api


def get_gpa_by_grade(grade) -> float:
    grade //= 5
    grade *= 5

    grades = {
        100: 4.0,
        95: 4.0,
        90: 3.67,
        85: 3.33,
        80: 3.0,
        75: 2.67,
        70: 2.33,
        65: 2.0,
        60: 1.67,
        55: 1.33,
        50: 1.0
    }

    return grades[grade]


def calculate_gpa(token):
    api = Api()
    courses = api.get_courses_grade(token)

    gpa = 0.0
    counter = 0

    for course in courses:
        try:
            course['grade'] = float(course['grade'])
        except Exception as ex:
            print(f"[ERROR] {ex}")
            continue

        if course['grade'] > 0:
            gpa += get_gpa_by_grade(course['grade'])
            counter += 1

    gpa /= counter

    answer = f"*Your GPA:* {gpa}\n\n"

    for course in courses:
        try:
            course['grade'] = float(course['grade'])
        except Exception as ex:
            print(f"[ERROR] {ex}")
            continue

        if course['grade'] > 0:
            answer += f"*{course['name'].split('|')[0]}* → {get_gpa_by_grade(course['grade'])}\n"

    return answer