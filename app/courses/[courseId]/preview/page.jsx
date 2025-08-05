import mySQL from "@/lib/db/database";
import { redirect } from "next/navigation";
import { checkInstructor, getLessonWithContent } from "@/lib/db/queries";
import CourseSidebar from "@/app/courses/components/courseContent/CourseSidebar";
import MobileHeader from "@/app/courses/components/courseContent/MobileHeader";
import { CourseProgressProvider } from "@/lib/courseProgressContext";
import InstructorViewBanner from "@/app/courses/components/courseContent/InstructorViewBanner";
import PreviewNavigation from "@/app/courses/components/courseContent/PreviewNavigation";
import { requireAuth } from "@/lib/auth/auth-actions";
import { getCourseAndModules } from "@/lib/serverActions";

// Function to transform the raw data
function transformLessonData(rawLessonData) {
  if (!rawLessonData || rawLessonData.length === 0) {
    return null;
  }

  // Extract lesson details from the first row
  const firstRow = rawLessonData[0];

  // Create the lesson object
  const lesson = {
    id: firstRow.lesson_id,
    title: firstRow.lesson_title,
    module_id: firstRow.module_id,
    module_title: firstRow.module_title,
    content: [],
  };

  // Add content items to the array
  rawLessonData.forEach((row) => {
    if (row.content_id) {
      lesson.content.push({
        id: row.content_id,
        type: row.content_type,
        value: row.value,
      });
    }
  });

  return lesson;
}

export default async function CoursePreviewPage({ params, searchParams }) {
  const { courseId } = await params;
  const { moduleId, lessonId } = await searchParams;
  const user = await requireAuth();
  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }

  // Verify that the user is the instructor of this course
  const instructorCheck = await mySQL(checkInstructor, [courseId]);
  console.log(instructorCheck);
  if (!instructorCheck.length || instructorCheck[0].instructor_id !== user.id) {
    redirect("/dashboard/courses");
    return null;
  }

  // Get course data
  const courseData = await getCourseAndModules(courseId);
  console.log(courseData);
  if (!courseData) {
    redirect("/dashboard/courses");
    return null;
  }

  // Default to first lesson if none selected
  const modId = moduleId || courseData.modules[0]?.id;
  const lessId = lessonId || courseData.modules[0]?.lessons[0]?.id;

  // Get current lesson content using the new query
  const rawLessonData = await mySQL(getLessonWithContent, [lessId]);
  const lessonWithContent = transformLessonData(rawLessonData);

  // For preview mode, we'll create an empty completedLessons array
  const completedLessons = [];

  return (
    <>
      <InstructorViewBanner
        isPreviewMode={true}
        isPublished={!!courseData.published}
      />

      {/* Add Preview Navigation */}
      <PreviewNavigation
        courseId={courseId}
        courseTitle={courseData.title}
        isPublished={!!courseData.published}
      />

      <CourseProgressProvider
        initialCompletedLessons={completedLessons}
        courseModules={courseData.modules}
      >
        <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden bg-white md:flex-row">
          {/* Mobile Header */}
          <MobileHeader
            title={`${courseData.title} (Preview Mode)`}
            course={courseData}
            activeModuleId={modId}
            activeLessonId={lessId}
            previewMode={true}
          />

          {/* Sidebar - hidden on mobile */}
          <div className="hidden h-full w-full overflow-y-auto border-r bg-white md:block md:w-80">
            <CourseSidebar
              course={courseData}
              activeModuleId={modId}
              activeLessonId={lessId}
              previewMode={true}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="border-b bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-600">
                  {lessonWithContent?.module_title && (
                    <span>{lessonWithContent.module_title}</span>
                  )}
                </div>
                <div className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  Preview Mode
                </div>
              </div>
            </div>

            {/* Lesson Content with structured format */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-3xl">
                {lessonWithContent && (
                  <>
                    {/* Lesson Title */}
                    <h1 className="mb-6 text-2xl font-bold">
                      {lessonWithContent.title}
                    </h1>

                    {/* Extract intro paragraph if text content exists */}
                    {(() => {
                      // Get text content items
                      const textContent = lessonWithContent.content.filter(
                        (item) => item.type === "TEXT",
                      );

                      // Get video and image content
                      const videoContent = lessonWithContent.content.find(
                        (item) => item.type === "VIDEO",
                      );

                      const imageContent = lessonWithContent.content.find(
                        (item) => item.type === "IMAGE",
                      );

                      // Extract intro paragraph if text content exists
                      const introText =
                        textContent.length > 0
                          ? textContent[0].value.split("\n")[0]
                          : "";

                      // Process remaining text content
                      let mainTextContent = [];

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
                        <>
                          {/* Intro paragraph */}
                          {introText && (
                            <div className="mb-6">
                              <p className="text-lg font-medium">{introText}</p>
                            </div>
                          )}

                          {/* Video (if exists) */}
                          {videoContent && (
                            <div className="my-6">
                              <div className="aspect-h-9 aspect-w-16">
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
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </CourseProgressProvider>
    </>
  );
}
