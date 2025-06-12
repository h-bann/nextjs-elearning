"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import {
  checkExistingProgress,
  getCompletedLessonsCount,
  getLoggedInUser,
  getModuleData,
  getModuleId,
  getTotalLessonsInCourse,
  newCourseProgress,
  updateEnrollmentRecord,
  updateExistingProgress,
} from "./queries";

export async function completeLessonAction(lessonId) {
  try {
    const numericLessonId = Number(lessonId);

    // Verify user is authenticated
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { error: "Unauthorized" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    // Get the course and module info for this lesson
    const lessonData = await mySQL(getModuleId, [numericLessonId]);

    if (!lessonData.length) {
      return { error: "Lesson not found" };
    }

    const moduleId = lessonData[0].module_id;

    // Get courseId from module
    const moduleData = await mySQL(getModuleData, [moduleId]);

    if (!moduleData.length) {
      return { error: "Module not found" };
    }

    const courseId = moduleData[0].course_id;

    // Check if progress record already exists
    // Fix the SQL query call syntax
    const existingProgress = await mySQL(checkExistingProgress, [
      user.id,
      numericLessonId,
    ]);

    if (existingProgress.length) {
      // Update existing record
      await mySQL(updateExistingProgress, [existingProgress[0].id]);
    } else {
      // Create new progress record
      await mySQL(newCourseProgress, [
        user.id,
        courseId,
        moduleId,
        numericLessonId,
      ]);
    }

    // Update overall course progress
    await updateCourseProgress(user.id, courseId);

    return {
      success: true,
      lessonId: numericLessonId,
    };
  } catch (error) {
    console.error("Error completing lesson:", error);
    return { error: "Failed to complete lesson" };
  }
}

async function updateCourseProgress(userId, courseId) {
  try {
    // Get total lessons in course
    const totalLessonsResult = await mySQL(getTotalLessonsInCourse, [courseId]);

    const totalLessons = totalLessonsResult[0].count;

    // Get completed lessons
    const completedLessonsResult = await mySQL(getCompletedLessonsCount, [
      userId,
      courseId,
    ]);

    const completedLessons = completedLessonsResult[0].count;

    // Calculate percentage
    const progressPercentage = Math.round(
      (completedLessons / totalLessons) * 100,
    );

    // Update enrollment record
    await mySQL(updateEnrollmentRecord, [progressPercentage, userId, courseId]);

    return true;
  } catch (error) {
    console.error("Error updating course progress:", error);
    return false;
  }
}

export async function getCompletedLessons(courseId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { error: "Unauthorized" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    // Get all completed lessons for this user in this course
    const completedLessons = await mySQL(
      `SELECT lesson_id FROM progress 
       WHERE user_id = ? AND course_id = ? AND completed = 1`,
      [user.id, courseId],
    );

    return {
      completedLessons: completedLessons.map((row) => row.lesson_id),
      userId: user.id,
    };
  } catch (error) {
    console.error("Error fetching completed lessons:", error);
    return { error: "Failed to fetch completion data" };
  }
}

export async function canAccessLesson(lessonId) {
  try {
    const numericLessonId = Number(lessonId);

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { error: "Unauthorized" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    // Get lesson details to find previous lesson
    const lessonInfo = await mySQL(
      `SELECT l.id, l.module_id, l.order_index, m.course_id, m.order_index as module_order
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = ?`,
      [numericLessonId],
    );

    if (!lessonInfo.length) {
      return { error: "Lesson not found" };
    }

    const { module_id, order_index, course_id, module_order } = lessonInfo[0];

    // Check if it's the first lesson of the course (always accessible)
    const firstLesson = await mySQL(
      `SELECT l.id
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE m.course_id = ?
       ORDER BY m.order_index, l.order_index
       LIMIT 1`,
      [course_id],
    );

    if (firstLesson.length && firstLesson[0].id == numericLessonId) {
      return { canAccess: true };
    }

    // Find the previous lesson
    let previousLesson;
    if (order_index > 1) {
      // Previous lesson in same module
      previousLesson = await mySQL(
        `SELECT id FROM lessons 
         WHERE module_id = ? AND order_index = ?`,
        [module_id, order_index - 1],
      );
    } else if (module_order > 1) {
      // Last lesson of previous module
      previousLesson = await mySQL(
        `SELECT l.id FROM lessons l
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = ? AND m.order_index = ?
         ORDER BY l.order_index DESC
         LIMIT 1`,
        [course_id, module_order - 1],
      );
    }

    // If no previous lesson, then it's accessible
    if (!previousLesson || !previousLesson.length) {
      return { canAccess: true };
    }

    // Check if previous lesson is completed
    const completion = await mySQL(
      `SELECT id FROM progress
       WHERE user_id = ? AND lesson_id = ? AND completed = 1`,
      [user.id, previousLesson[0].id],
    );

    return { canAccess: completion.length > 0 };
  } catch (error) {
    console.error("Error checking lesson access:", error);
    return { error: "Failed to check lesson access" };
  }
}
