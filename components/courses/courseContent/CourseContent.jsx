// components/courses/courseContent/CourseContent.jsx
import CompleteLessonButton from "./CompleteLessonButton";
import mySQL from "@/lib/database";
import { getLessonCompletionStatus } from "@/lib/queries";

export default async function CourseContent({
  lesson,
  userId,
  courseId,
  isInstructor = false,
}) {
  // Only check completion status for students (not instructors)
  let isCompleted = false;
  if (!isInstructor && lesson && lesson.length > 0) {
    const completionStatus = await mySQL(getLessonCompletionStatus, [
      lesson[0]?.lesson_id,
      userId,
    ]);
    isCompleted = completionStatus.length > 0;
  }
  console.log(lesson);

  if (!lesson || lesson.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Lesson not found</p>
      </div>
    );
  }
  // Organize content by type
  const title = lesson[0].title;
  const videoContent = lesson.find((item) => item.content_type === "VIDEO");
  const imageContent = lesson.find((item) => item.content_type === "IMAGE");

  // Get all text content items
  const textContent = lesson.filter((item) => item.content_type === "TEXT");

  // If there's text content, use the first paragraph as intro
  const introText =
    textContent.length > 0 ? textContent[0].value.split("\n")[0] : "";

  // The rest of the text content (including remaining paragraphs of the first text item)
  const mainTextContent = [];

  if (textContent.length > 0) {
    // For the first text item, skip the first paragraph (intro)
    const firstTextItem = textContent[0];
    const paragraphs = firstTextItem.value.split("\n");

    if (paragraphs.length > 1) {
      // Add remaining paragraphs from first text content
      mainTextContent.push({
        ...firstTextItem,
        value: paragraphs.slice(1).join("\n"),
      });
    }

    // Add all other text content items
    if (textContent.length > 1) {
      mainTextContent.push(...textContent.slice(1));
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Lesson Header - Fixed height */}
      <div className="shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{title}</h1>
          {!isInstructor && (
            <CompleteLessonButton
              lessonId={lesson[0].lesson_id}
              isCompleted={isCompleted}
              courseId={courseId}
            />
          )}
          {isInstructor && (
            <div className="text-sm text-gray-500">Instructor View</div>
          )}
        </div>
        {lesson[0].module_title && (
          <p className="mt-1 text-sm text-gray-600">
            Module: {lesson[0].module_title}
          </p>
        )}
      </div>

      {/* Lesson Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          {/* Intro paragraph */}
          {introText && (
            <div className="mb-6">
              <p className="text-lg font-medium">{introText}</p>
            </div>
          )}

          {/* Video (if exists) */}
          {videoContent && (
            <div className="my-6">
              <div className="aspect-w-16 aspect-h-9">
                <video
                  src={videoContent.value}
                  controls
                  className="w-full rounded-lg shadow-md"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Image (if exists and no video) */}
          {!videoContent && imageContent && (
            <div className="my-6">
              <img
                src={imageContent.value}
                alt="Lesson content"
                className="max-w-full rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Main text content */}
          {mainTextContent.map((item, index) => (
            <div key={`text-${index}`} className="mb-6">
              {item.value.split("\n").map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i} className="mb-4">
                    {paragraph}
                  </p>
                ) : null,
              )}
            </div>
          ))}

          {/* Image (if exists and there's a video - show image after main text) */}
          {videoContent && imageContent && (
            <div className="my-6">
              <img
                src={imageContent.value}
                alt="Lesson content"
                className="max-w-full rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
