"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CourseProgressContext = createContext({
  completedLessons: [],
  isLessonCompleted: () => false,
  isLessonAvailable: () => false,
});

export function CourseProgressProvider({
  children,
  initialCompletedLessons = [],
  courseModules = [],
}) {
  // Ensure completed lessons are all numbers for consistent comparison
  const normalizedCompletedLessons = initialCompletedLessons.map((id) =>
    Number(id)
  );
  const [completedLessons, setCompletedLessons] = useState(
    normalizedCompletedLessons
  );

  // Check if a lesson is completed
  const isLessonCompleted = (lessonId) => {
    // Convert to number for comparison
    return completedLessons.includes(Number(lessonId));
  };

  // Logic to determine if a lesson is available to be accessed
  const isLessonAvailable = (moduleIndex, lessonIndex) => {
    // First lesson is always available
    if (moduleIndex === 0 && lessonIndex === 0) return true;

    // Get the previous lesson
    let prevLesson;
    if (lessonIndex > 0) {
      // Previous lesson in same module
      prevLesson = courseModules[moduleIndex]?.lessons[lessonIndex - 1];
    } else if (moduleIndex > 0) {
      // Last lesson of previous module
      const prevModule = courseModules[moduleIndex - 1];
      prevLesson = prevModule?.lessons[prevModule.lessons.length - 1];
    }

    // Check if previous lesson is completed
    return prevLesson ? isLessonCompleted(prevLesson.id) : true;
  };

  const value = {
    completedLessons,
    isLessonCompleted,
    isLessonAvailable,
  };

  return (
    <CourseProgressContext.Provider value={value}>
      {children}
    </CourseProgressContext.Provider>
  );
}

export const useCourseProgress = () => useContext(CourseProgressContext);
