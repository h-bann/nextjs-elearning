import mySQL from "./database";
import { getContent, getCourse, getLessons, getModules } from "./queries";

export async function getCourseAndModules(courseId) {
  const course = await mySQL(getCourse, [courseId]);

  const modules = await mySQL(getModules, [courseId]);
  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const lessons = await mySQL(getLessons, [module.id]);
      const lessonsWithContent = await Promise.all(
        lessons.map(async (lesson) => {
          const content = await mySQL(getContent, [lesson.id]);

          return {
            ...lesson,
            content: content,
          };
        })
      );

      return { ...module, lessons: lessonsWithContent };
    })
  );
  return {
    ...course[0],
    modules: modulesWithLessons,
  };
}
