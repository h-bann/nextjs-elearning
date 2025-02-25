import Image from "next/image";
import CompleteLessonButton from "./CompleteLessonButton";
import mySQL from "@/lib/database";
import { getLessonCompletionStatus } from "@/lib/queries";

export default async function CourseContent({ lesson, userId }) {
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
            />
          )}
        </div>
        {lesson.module_title && (
          <p className="text-gray-600">Module: {lesson.module_title}</p>
        )}
      </div>

      {/* Lesson Content */}
      <div className="flex flex-row-reverse justify-end">
        {lesson.map((item) => {
          switch (item.content_type) {
            case "TEXT":
              return <p key={item.id}>{item.value}</p>;

            case "IMAGE":
              return (
                <Image
                  key={item.id}
                  src={item.value}
                  alt="Lesson content"
                  width={300}
                  height={200}
                />
              );

            default:
              return <p key={item.id}>{item.value}</p>; // Fallback for unknown types
          }
        })}
      </div>
    </div>
  );
}
