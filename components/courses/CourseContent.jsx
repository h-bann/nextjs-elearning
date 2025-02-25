import Image from "next/image";
import CompleteLessonButton from "./CompleteLessonButton";
import mySQL from "@/lib/database";
import { getLessonCompletionStatus } from "@/lib/queries";

export default async function CourseContent({ lesson, userId, courseId }) {
  const completionStatus = await mySQL(getLessonCompletionStatus, [
    lesson[0]?.lesson_id,
    userId,
  ]);
  const isCompleted = completionStatus.length > 0;

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {!lesson.completed && (
            <CompleteLessonButton
              lessonId={lesson[0].lesson_id}
              isCompleted={isCompleted}
              courseId={
                courseId
              } /* Pass courseId to the button in case needed */
            />
          )}
        </div>
        {lesson[0].module_title && (
          <p className="text-gray-600">Module: {lesson[0].module_title}</p>
        )}
      </div>

      {/* Lesson Content */}
      <div className="flex flex-row-reverse justify-end">
        {lesson.map((item) => {
          switch (item.content_type) {
            case "TEXT":
              return (
                <div key={item.id} className="mb-4">
                  {item.value.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              );

            case "IMAGE":
              return (
                <div key={item.id} className="my-6">
                  <img
                    src={item.value}
                    alt="Lesson content"
                    className="max-w-full rounded-lg shadow-md"
                  />
                </div>
              );

            default:
              return <p key={item.id}>{item.value}</p>; // Fallback for unknown types
          }
        })}
      </div>
    </div>
  );
}
