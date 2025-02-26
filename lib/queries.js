export const checkExistingUser = `SELECT user_id FROM users WHERE email = ?;`;

export const createUser = `INSERT INTO users (user_id, role, username, email, password) VALUES (?, ?, ?, ?, ?);`;

export const getUser = `SELECT * FROM users WHERE email = ?;`;

export const getLoggedInUser = `SELECT id, user_id, role, username, email FROM users WHERE user_id = ?;`;

export const checkExistingEmails = `SELECT user_id FROM users WHERE email = ? AND user_id != ?;`;

export const updateUser = `UPDATE users SET username = ?, email = ? WHERE user_id = ?;`;

export const getUserPassword = `SELECT password FROM users WHERE user_id = ?;`;

export const updateUserPassword = `UPDATE users SET password = ? WHERE user_id = ?;`;

export const checkUserRole = `SELECT role FROM users WHERE user_id = ?;`;

export const checkInstructor = `SELECT instructor_id FROM courses WHERE id = ?;`;

export const getInstructorCourse = `SELECT c.*, 
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count
    FROM courses c 
    WHERE c.instructor_id = ?
    ORDER BY c.created_at DESC;`;

export const getEnrolledCourse = `SELECT 
    c.*,
    u.username AS instructor_name,
    (SELECT COUNT(*) FROM progress p 
     JOIN lessons l ON p.lesson_id = l.id 
     WHERE p.completed = true AND l.module_id IN (SELECT id FROM modules WHERE course_id = c.id) AND p.user_id = ?) AS completed_lessons,
    (SELECT COUNT(*) FROM lessons l WHERE l.module_id IN (SELECT id FROM modules WHERE course_id = c.id)) AS total_lessons,
    (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS module_count,
    e.created_at AS enrollment_date,
    e.progress AS progress_percentage
FROM courses c
JOIN enrollments e ON e.course_id = c.id
JOIN users u ON c.instructor_id = u.id
WHERE e.user_id = ? AND e.status = 'ACTIVE'
ORDER BY e.last_accessed DESC;`;

export const insertCourse = `INSERT INTO courses (
        title,
        description,
        price,
        image_url,
        instructor_id,
        published
      ) VALUES (?, ?, ?, ?, ?, ?);`;

// export const getAllCourses = `SELECT * FROM courses;`;

export const getCourse = `SELECT * FROM courses WHERE id = ?;`;

export const getModules = `SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC;`;

export const getLessons = `SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index ASC;`;

export const getContent = `SELECT * FROM lesson_content WHERE lesson_id = ?;`;

export const insertModules = `INSERT INTO modules (course_id, title, order_index) VALUES (?, ?, ?);`;

export const deleteModule = `DELETE FROM modules WHERE id = ? AND course_id = ?;`;

export const insertLessons = `INSERT INTO lessons (module_id, title, order_index) VALUES (?, ?, ?);`;

export const deleteLesson = `DELETE FROM lessons WHERE id = ? AND module_id = ?;`;

export const deleteMultipleLessons = `DELETE FROM lessons WHERE module_id = ?;`;

export const deleteModuleAndLessons = `
DELETE modules, lessons FROM modules
LEFT JOIN lessons ON lessons.module_id = modules.id
WHERE modules.id = ? AND modules.course_id = ?;
`;

export const addContent = `
  INSERT INTO lesson_content (lesson_id, content_type, value) 
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE value = VALUES(value);
`;

export const reorderModules = `UPDATE modules SET order_index = ? WHERE id = ? AND course_id = ?;`;

export const reorderLessons = `UPDATE lessons SET order_index = ? WHERE id = ? AND module_id = ?;`;

export const getAllCourses = `SELECT 
    courses.title, courses.id, courses.description, courses.price, courses.image_url,
    users.username as instructor_name,
    COUNT(enrollments.id) as enrollment_count
  FROM courses 
  JOIN users ON courses.instructor_id = users.id
  LEFT JOIN enrollments  ON courses.id = enrollments.course_id 
  WHERE courses.published = published
  GROUP BY courses.id;`;

export const getUserEnrollments = `SELECT course_id FROM enrollments WHERE user_id = ?;`;

export const checkExistingEnrollment = `SELECT id, status FROM enrollments
                                          WHERE user_id = ? AND course_id = ? AND status IN ('ACTIVE', 'PAYMENT_PENDING');`;

export const updateEnrollmentRecord = `INSERT INTO enrollments (id, user_id, course_id, price, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)`;

export const getLessonCompletionStatus = `
  SELECT * FROM progress 
  WHERE lesson_id = ? AND user_id = ? AND completed = true
`;

export const getStudentStat = `SELECT 
        COUNT(DISTINCT e.course_id) AS enrolled_courses,
        SUM(CASE WHEN e.progress = 100 THEN 1 ELSE 0 END) AS completed_courses
    FROM 
        enrollments e
    WHERE 
        e.user_id = ? 
        AND e.status = 'ACTIVE';`;

export const getCourseStats = ` SELECT 
        COUNT(DISTINCT id) AS total_courses
    FROM 
        courses
    WHERE 
        instructor_id = ?;`;

export const getInstructorStudentStats = `SELECT 
        COUNT(DISTINCT e.user_id) AS total_students,
        SUM(CASE WHEN e.progress = 100 THEN 1 ELSE 0 END) AS course_completions
    FROM 
        enrollments e
    JOIN
        courses c ON e.course_id = c.id
    WHERE 
        c.instructor_id = ?
        AND e.status = 'ACTIVE';`;

export const newCourseProgress = `INSERT INTO progress (user_id, course_id, module_id, lesson_id, completed)
         VALUES (?, ?, ?, ?, 1);`;

export const updateExistingProgress = `UPDATE progress SET completed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`;

export const checkExistingProgress = `SELECT id FROM progress WHERE user_id = ? AND lesson_id = ?;`;

export const getModuleId = `SELECT module_id FROM lessons WHERE id = ?;`;

export const getModuleData = `SELECT course_id FROM modules WHERE id = ?;`;

export const getTotalLessonsInCourse = `SELECT COUNT(*) as count FROM lessons
       WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?);`;

export const getCompleteLessons = `SELECT COUNT(*) as count FROM progress
       WHERE user_id = ? AND course_id = ? AND completed = 1;`;
