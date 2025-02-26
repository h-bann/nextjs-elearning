import CompleteLessonButton from "./CompleteLessonButton";
import mySQL from "@/lib/database";
import { getLessonCompletionStatus } from "@/lib/queries";

export default async function CourseContent({ lesson, userId, courseId }) {
  const completionStatus = await mySQL(getLessonCompletionStatus, [
    lesson[0]?.lesson_id,
    userId,
  ]);
  const isCompleted = completionStatus.length > 0;

  if (!lesson || lesson.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Lesson Header - Fixed height */}
      <div className="py-4 px-6 border-b bg-white shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{lesson[0].title}</h1>
          <CompleteLessonButton
            lessonId={lesson[0].lesson_id}
            isCompleted={isCompleted}
            courseId={courseId}
          />
        </div>
        {lesson[0].module_title && (
          <p className="text-gray-600 text-sm mt-1">
            Module: {lesson[0].module_title}
          </p>
        )}
      </div>

      {/* Lesson Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {lesson.map((item) => {
            switch (item.content_type) {
              case "TEXT":
                return (
                  <div key={item.id} className="mb-6">
                    {item.value.split("\n").map((paragraph, i) =>
                      paragraph.trim() ? (
                        <p key={i} className="mb-4">
                          {paragraph}
                        </p>
                      ) : null
                    )}
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
    </div>
  );
}
