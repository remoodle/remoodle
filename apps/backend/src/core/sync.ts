import type {
  IUser,
  MoodleCourse,
  MoodleCourseClassification,
} from "@remoodle/types";
import { Moodle } from "../library/moodle";
import { db } from "../library/db";
import { trackCourseDiff } from "./events/grades";
import type { GradeChangeDiff } from "./events/grades";

const handleTokenError = async (error: { message: string }, user: IUser) => {
  if (error.message.includes("Invalid token")) {
    await db.user.updateOne(
      { _id: user._id },
      { $set: { health: user.health - 1 } },
    );
  }
};

const handleNotInGroupError = async (
  error: { message: string },
  user: IUser,
  courseId: number,
) => {
  if (error.message.includes("error/notingroup")) {
    await db.course.updateOne(
      { userId: user._id, "data.id": courseId },
      { $set: { notingroup: true } },
    );
  }
};

export const syncEvents = async (userId: string) => {
  const user = await db.user.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const client = new Moodle(user.moodleToken);

  const [response, error] = await client.call(
    "core_calendar_get_action_events_by_timesort",
    {
      timesortfrom: Math.floor(Date.now() / 1000 / 86400) * 86400,
    },
  );

  if (error) {
    await handleTokenError(error, user);
    throw new Error(`Failed to get events: ${error.message}`);
  }

  const filteredEvents = response.events.filter(
    (event) => event.component !== "mod_attendance",
  );

  for (const event of filteredEvents) {
    await db.event.findOneAndUpdate(
      { userId, "data.id": event.id },
      {
        $set: {
          data: event,
        },
      },
      { upsert: true },
    );
  }

  await db.event.deleteMany({
    userId,
    "data.id": { $nin: filteredEvents.map((event) => event.id) },
  });
};

export const syncCourses = async (
  userId: string,
  classification: MoodleCourseClassification[] = ["inprogress", "past"],
) => {
  const user = await db.user.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const client = new Moodle(user.moodleToken);

  const courses: {
    data: MoodleCourse;
    classification: MoodleCourseClassification;
  }[] = [];

  for (const variant of classification) {
    const [response, error] = await client.call(
      "core_course_get_enrolled_courses_by_timeline_classification",
      { classification: variant },
    );

    if (error) {
      await handleTokenError(error, user);
      throw new Error(`Failed to get ${variant} courses: ${error.message}`);
    }

    courses.push(
      ...response.courses.map((course) => ({
        data: course,
        classification: variant,
      })),
    );
  }

  for (const course of courses) {
    await db.course.findOneAndUpdate(
      { userId, "data.id": course.data.id },
      {
        userId,
        data: course.data,
        classification: course.classification,
        deleted: false,
      },
      { upsert: true },
    );
  }

  // mark all other courses that are not in the response as deleted
  await db.course.updateMany(
    { userId, "data.id": { $nin: courses.map((course) => course.data.id) } },
    { deleted: true },
  );
};

export const syncCourseGrades = async (
  userId: string,
  courseId: number,
  courseName: string,
  trackDiff: boolean,
) => {
  const user = await db.user.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const client = new Moodle(user.moodleToken);

  const [response, error] = await client.call(
    "gradereport_user_get_grade_items",
    {
      userid: user.moodleId,
      courseid: courseId,
    },
  );

  if (error) {
    await handleTokenError(error, user);
    await handleNotInGroupError(error, user, courseId);
    throw new Error(`Failed to get grades for ${courseId}: ${error.message}`);
  }

  const normalizedGrades = response.usergrades[0].gradeitems.filter(
    (grade) => grade.itemtype !== "course",
  );

  const currentGrades = await db.grade.find({
    userId,
    courseId,
    "data.id": {
      $in: normalizedGrades.map((grade) => grade.id),
    },
  });

  for (const grade of normalizedGrades) {
    await db.grade.findOneAndUpdate(
      { userId, "data.id": grade.id },
      {
        userId,
        courseId,
        data: grade,
      },
      { upsert: true },
    );
  }

  if (
    !currentGrades.length ||
    !trackDiff ||
    !user.telegramId ||
    !user.notificationSettings.telegram.gradeUpdates
  ) {
    return;
  }

  const updatedGrades = await db.grade.find({
    userId,
    courseId,
    "data.id": {
      $in: response.usergrades[0].gradeitems.map((grade) => grade.id),
    },
  });

  const changes = trackCourseDiff(
    currentGrades.map((grade) => grade.data),
    updatedGrades.map((grade) => grade.data),
  );

  const gradeChangeDiff: GradeChangeDiff = {
    courseId,
    courseName,
    changes,
  };

  return gradeChangeDiff;
};
