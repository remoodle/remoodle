
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
