export const checkExistingUser = `
  SELECT user_id 
  FROM users 
  WHERE email = ?;
`;

export const createUser = `
  INSERT INTO users (user_id, role, username, email, password, verified, verification_token, verification_expiry) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

export const findVerificationToken = `
SELECT users.user_id, users.email, users.username, users.entry_date, users.verification_token, users.verification_expiry FROM users
WHERE verification_token = ? AND verification_expiry > ?;`;

export const updateVerification = `
UPDATE users SET verified = TRUE, verification_token = NULL, verification_expiry = NULL WHERE user_id = ?
;`;

export const newVerificationToken = `
UPDATE users SET verification_token = ?, verification_expiry = ? WHERE user_id = ?;`;

export const usedVerificationToken = `SELECT * FROM users WHERE verified = TRUE AND verification_token IS NULL;`;

export const getUser = `
  SELECT users.id, users.user_id, users.role, users.username, users.password, users.email, users.entry_date, users.verified, users.verification_token, users.verification_expiry 
  FROM users 
  WHERE email = ?;
`;

export const getLoggedInUser = `
  SELECT id, user_id, role, username, email 
  FROM users 
  WHERE user_id = ?;
`;

export const checkExistingEmails = `
  SELECT user_id 
  FROM users 
  WHERE email = ? 
  AND user_id != ?;
`;

export const updateUser = `
  UPDATE users 
  SET username = ?, email = ? 
  WHERE user_id = ?;
`;

export const getUserPassword = `
  SELECT password 
  FROM users 
  WHERE user_id = ?;
`;

export const updateUserPassword = `
  UPDATE users 
  SET password = ? 
  WHERE user_id = ?;
`;

export const checkUserRole = `
  SELECT role 
  FROM users 
  WHERE user_id = ?;
`;

export const checkInstructor = `
  SELECT instructor_id 
  FROM courses 
  WHERE id = ?;
`;

export const getInstructorCourse = `
  SELECT 
    c.*, 
    (
      SELECT COUNT(*) 
      FROM enrollments 
      WHERE course_id = c.id
    ) AS student_count
  FROM courses c 
  WHERE c.instructor_id = ?
  ORDER BY c.created_at DESC;
`;

export const getEnrolledCourse = `
  SELECT 
    c.*,
    u.username AS instructor_name,
    (
      SELECT COUNT(*) 
      FROM progress p 
      JOIN lessons l ON p.lesson_id = l.id 
      WHERE p.completed = true 
      AND l.module_id IN (
        SELECT id 
        FROM modules 
        WHERE course_id = c.id
      ) 
      AND p.user_id = ?
    ) AS completed_lessons,
    (
      SELECT COUNT(*) 
      FROM lessons l 
      WHERE l.module_id IN (
        SELECT id 
        FROM modules 
        WHERE course_id = c.id
      )
    ) AS total_lessons,
    (
      SELECT COUNT(*) 
      FROM modules m 
      WHERE m.course_id = c.id
    ) AS module_count,
    e.created_at AS enrollment_date,
    e.progress AS progress_percentage
  FROM courses c
  JOIN enrollments e ON e.course_id = c.id
  JOIN users u ON c.instructor_id = u.id
  WHERE e.user_id = ? 
  AND e.status = 'ACTIVE'
  ORDER BY e.last_accessed DESC;
`;

export const insertCourse = `
  INSERT INTO courses (
    title,
    description,
    price,
    image_url,
    instructor_id,
    published
  ) 
  VALUES (?, ?, ?, ?, ?, ?);
`;

export const publishCourse = `
  UPDATE courses 
  SET published = ? 
  WHERE id = ? 
  AND instructor_id = ?;
`;

export const unpublishCourse = `
  UPDATE courses 
  SET published = ? 
  WHERE id = ? 
  AND instructor_id = ?;
`;

export const getCourse = `
  SELECT * 
  FROM courses 
  WHERE id = ?;
`;

export const getModules = `
  SELECT * 
  FROM modules 
  WHERE course_id = ? 
  ORDER BY order_index ASC;
`;

export const getLessons = `
  SELECT * 
  FROM lessons 
  WHERE module_id = ? 
  ORDER BY order_index ASC;
`;

export const getContent = `
  SELECT * 
  FROM lesson_content 
  WHERE lesson_id = ?;
`;

export const deleteMediaContent = `
  DELETE FROM lesson_content 
  WHERE lesson_id = ? AND content_type = ?
`;

export const insertModules = `
  INSERT INTO modules (course_id, title, order_index) 
  VALUES (?, ?, ?);
`;

export const deleteModule = `
  DELETE FROM modules 
  WHERE id = ? 
  AND course_id = ?;
`;

export const insertLessons = `
  INSERT INTO lessons (module_id, title, order_index) 
  VALUES (?, ?, ?);
`;

export const deleteLesson = `
  DELETE FROM lessons 
  WHERE id = ? 
  AND module_id = ?;
`;

export const deleteMultipleLessons = `
  DELETE FROM lessons 
  WHERE module_id = ?;
`;

export const deleteModuleAndLessons = `
  DELETE modules, lessons 
  FROM modules
  LEFT JOIN lessons ON lessons.module_id = modules.id
  WHERE modules.id = ? 
  AND modules.course_id = ?;
`;

export const addContent = `
  INSERT INTO lesson_content (lesson_id, content_type, value) 
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE value = VALUES(value);
`;

export const reorderModules = `
  UPDATE modules 
  SET order_index = ? 
  WHERE id = ? 
  AND course_id = ?;
`;

export const reorderLessons = `
  UPDATE lessons 
  SET order_index = ? 
  WHERE id = ? 
  AND module_id = ?;
`;

export const getAllCourses = `
  SELECT 
    courses.title, 
    courses.id, 
    courses.description, 
    courses.price, 
    courses.image_url,
    users.username AS instructor_name,
    COUNT(enrollments.id) AS enrollment_count
  FROM courses 
  JOIN users ON courses.instructor_id = users.id
  LEFT JOIN enrollments ON courses.id = enrollments.course_id 
  WHERE courses.published = published
  GROUP BY courses.id;
`;

export const getUserEnrollments = `
  SELECT course_id 
  FROM enrollments 
  WHERE user_id = ?;
`;

export const checkExistingEnrollment = `
  SELECT id, status 
  FROM enrollments
  WHERE user_id = ? 
  AND course_id = ? 
  AND status IN ('ACTIVE', 'PAYMENT_PENDING');
`;

export const createEnrollmentRecord = `
  INSERT INTO enrollments (id, user_id, course_id, price, transaction_id, status) 
  VALUES (?, ?, ?, ?, ?, ?);
`;

export const getLessonCompletionStatus = `
  SELECT * 
  FROM progress 
  WHERE lesson_id = ? 
  AND user_id = ? 
  AND completed = true;
`;

export const getStudentStat = `
  SELECT 
    COUNT(DISTINCT e.course_id) AS enrolled_courses,
    SUM(CASE WHEN e.progress = 100 THEN 1 ELSE 0 END) AS completed_courses
  FROM enrollments e
  WHERE e.user_id = ? 
  AND e.status = 'ACTIVE';
`;

export const getCourseStats = `
  SELECT 
    COUNT(DISTINCT id) AS total_courses
  FROM courses
  WHERE instructor_id = ?;
`;

export const getInstructorStudentStats = `
  SELECT 
    COUNT(DISTINCT e.user_id) AS total_students,
    SUM(CASE WHEN e.progress = 100 THEN 1 ELSE 0 END) AS course_completions
  FROM enrollments e
  JOIN courses c ON e.course_id = c.id
  WHERE c.instructor_id = ?
  AND e.status = 'ACTIVE';
`;

export const newCourseProgress = `
  INSERT INTO progress (user_id, course_id, module_id, lesson_id, completed)
  VALUES (?, ?, ?, ?, 1);
`;

export const updateExistingProgress = `
  UPDATE progress 
  SET completed = 1, 
      updated_at = CURRENT_TIMESTAMP 
  WHERE id = ?;
`;

export const checkExistingProgress = `
  SELECT id 
  FROM progress 
  WHERE user_id = ? 
  AND lesson_id = ?;
`;

export const getModuleId = `
  SELECT module_id 
  FROM lessons 
  WHERE id = ?;
`;

export const getModuleData = `
  SELECT course_id 
  FROM modules 
  WHERE id = ?;
`;

export const getTotalLessonsInCourse = `
  SELECT COUNT(*) AS count 
  FROM lessons
  WHERE module_id IN (
    SELECT id 
    FROM modules 
    WHERE course_id = ?
  );
`;

export const getCompletedLessonsCount = `
  SELECT COUNT(*) AS count 
  FROM progress 
  WHERE user_id = ? 
  AND course_id = ? 
  AND completed = 1;
`;

export const updateEnrollmentRecord = `
  UPDATE enrollments 
  SET progress = ?, 
      last_accessed = CURRENT_TIMESTAMP
  WHERE user_id = ? 
  AND course_id = ?;
`;

export const getUserRecentActivities = `
  SELECT 
    'enrollment' AS type, 
    c.id AS course_id, 
    c.title AS course_title,
    e.enrolled_at AS timestamp, 
    CONCAT('Enrolled in ', c.title) AS description
  FROM enrollments e
  JOIN courses c ON e.course_id = c.id
  WHERE e.user_id = ? 
  AND e.status = 'ACTIVE'
  
  UNION ALL
  
  SELECT 
    'completion' AS type, 
    c.id AS course_id, 
    c.title AS course_title,
    p.updated_at AS timestamp, 
    CONCAT('Completed a lesson in ', c.title) AS description
  FROM progress p
  JOIN lessons l ON p.lesson_id = l.id
  JOIN modules m ON l.module_id = m.id
  JOIN courses c ON m.course_id = c.id
  WHERE p.user_id = ? 
  AND p.completed = 1
  
  ORDER BY timestamp DESC 
  LIMIT 10;
`;

export const getLessonWithContent = `
  SELECT 
    l.id AS lesson_id,
    l.title AS lesson_title,
    l.module_id,
    m.title AS module_title,
    lc.id AS content_id,
    lc.content_type,
    lc.value
  FROM 
    lessons l
  LEFT JOIN 
    lesson_content lc ON l.id = lc.lesson_id
  LEFT JOIN
    modules m ON l.module_id = m.id
  WHERE 
    l.id = ?
`;

// ! ACCOUNT DELETION QUERIES

export const deleteProgressRecords = `
DELETE FROM progress WHERE user_id = ?;`;

export const deleteUserEnrollments = `
DELETE FROM enrollments WHERE user_id = ?;
`;

export const deleteUserAccount = `
DELETE FROM users WHERE id = ?;`;

// ! USER DATA DOWNLOAD QUERIES

export const getUserPersonalInfo = `
SELECT user_id, username, email, role, entry_date
     FROM users WHERE id = ?;`;

export const getUserEnrollmentData = `
     SELECT e.*, c.title as course_title, c.description, c.price, 
            u.username as instructor_name
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     JOIN users u ON c.instructor_id = u.id
     WHERE e.user_id = ?
          ORDER BY e.enrolled_at DESC;`;

export const getUserProgressData = `
     SELECT p.*, l.title as lesson_title, m.title as module_title, c.title as course_title
          FROM progress p
          JOIN lessons l ON p.lesson_id = l.id
          JOIN modules m ON l.module_id = m.id
          JOIN courses c ON m.course_id = c.id
          WHERE p.user_id = ?
          ORDER BY p.updated_at DESC`;

//!  EMAIL VERIFICATION QUERIES
export const findVerificationTokenWithUserData = `
  SELECT users.user_id, users.email, users.username 
  FROM users 
  WHERE verification_token = ? AND verification_expiry > ?;
`;

//!  AUTHENTICATION QUERIES
export const checkUserExists = `
  SELECT user_id 
  FROM users 
  WHERE email = ?;
`;

export const updateUserVerificationToken = `
  UPDATE users 
  SET verification_token = ?, verification_expiry = ? 
  WHERE user_id = ?;
`;

//! COURSE MANAGEMENT QUERIES

export const updateCourseWithImage = `
  UPDATE courses 
  SET title = ?, description = ?, price = ?, image_url = ?
  WHERE id = ? AND instructor_id = ?;
`;

export const updateCourseWithoutImage = `
  UPDATE courses 
  SET title = ?, description = ?, price = ?
  WHERE id = ? AND instructor_id = ?;
`;

// ! PROGRESS AND COMPLETION QUERIES
export const getCompletedLessonsForUser = `
  SELECT lesson_id 
  FROM progress 
  WHERE user_id = ? AND course_id = ? AND completed = 1;
`;

export const getLessonInfo = `
  SELECT l.id, l.module_id, l.order_index, m.course_id, m.order_index as module_order
  FROM lessons l
  JOIN modules m ON l.module_id = m.id
  WHERE l.id = ?;
`;

export const getFirstLessonInCourse = `
  SELECT l.id
  FROM lessons l
  JOIN modules m ON l.module_id = m.id
  WHERE m.course_id = ?
  ORDER BY m.order_index, l.order_index
  LIMIT 1;
`;

export const getPreviousLessonInModule = `
  SELECT id 
  FROM lessons 
  WHERE module_id = ? AND order_index = ?;
`;

export const getLastLessonOfPreviousModule = `
  SELECT l.id 
  FROM lessons l
  JOIN modules m ON l.module_id = m.id
  WHERE m.course_id = ? AND m.order_index = ?
  ORDER BY l.order_index DESC
  LIMIT 1;
`;

export const checkLessonCompletion = `
  SELECT id 
  FROM progress
  WHERE user_id = ? AND lesson_id = ? AND completed = 1;
`;

//!  VERIFICATION STATUS QUERIES
export const getUserVerificationStatus = `
  SELECT oneid_verified, oneid_verification_date, oneid_verification_data, role 
  FROM users 
  WHERE user_id = ?;
`;

export const getUserVerificationStatusById = `
  SELECT oneid_verified, oneid_verification_date, role 
  FROM users 
  WHERE id = ?;
`;

//!  TRANSACTION QUERIES
export const startTransaction = `START TRANSACTION;`;
export const commitTransaction = `COMMIT;`;
export const rollbackTransaction = `ROLLBACK;`;

//!  PURCHASE AND WEBHOOK QUERIES
export const updatePurchaseStatus = `
  UPDATE purchases 
  SET transaction_id = ?, status = ? 
  WHERE id = ?;
`;

export const createEnrollmentFromPurchase = `
  INSERT INTO enrollments (user_id, course_id)
  SELECT user_id, course_id FROM purchases WHERE id = ?;
`;

//!  INSTRUCTOR COURSE QUERIES
export const getInstructorCourses = `
  SELECT id, title, description, price, created_at, published
  FROM courses 
  WHERE instructor_id = ?;
`;

// export const checkCourseStudents = `
//   SELECT COUNT(*) as student_count
//   FROM enrollments
//   WHERE course_id IN (${courseIds.map(() => "?").join(",")})
//   AND status = 'ACTIVE';
// `;

export const deleteLessonContent = `
  DELETE FROM lesson_content 
  WHERE lesson_id IN (
    SELECT id FROM lessons 
    WHERE module_id IN (
      SELECT id FROM modules 
      WHERE course_id = ?
    )
  );
`;

export const deleteLessonsByModule = `
  DELETE FROM lessons 
  WHERE module_id IN (
    SELECT id FROM modules 
    WHERE course_id = ?
  );
`;

export const deleteModulesByCourse = `
  DELETE FROM modules 
  WHERE course_id = ?;
`;

export const deleteCourseById = `
  DELETE FROM courses 
  WHERE id = ?;
`;

//!  DATA EXPORT QUERIES
export const getUserLoginHistory = `
  SELECT login_time, ip_address, user_agent
  FROM user_login_history
  WHERE user_id = ?
  ORDER BY login_time DESC
  LIMIT 100;
`;

export const getUserPurchases = `
  SELECT p.*, c.title as course_title
  FROM purchases p
  JOIN courses c ON p.course_id = c.id
  WHERE p.user_id = ?
  ORDER BY p.created_at DESC;
`;

export const getUserSettings = `
  SELECT * 
  FROM user_settings 
  WHERE user_id = ?;
`;

//!  LESSON CONTENT MANAGEMENT
export const updateContentValue = `
  INSERT INTO lesson_content (lesson_id, content_type, value) 
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE value = VALUES(value);
`;

//!  COURSE REORDERING QUERIES
export const updateModuleOrder = `
  UPDATE modules 
  SET order_index = ? 
  WHERE id = ?;
`;

export const updateLessonOrder = `
  UPDATE lessons 
  SET order_index = ? 
  WHERE id = ?;
`;

// ! AUTH-ACTIONS SPECIFIC QUERIES
export const createUserWithVerification = `
  INSERT INTO users (user_id, role, username, email, password, verified, verification_token, verification_expiry) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

export const getUserByEmail = `
  SELECT user_id, email, username, password, verified, role
  FROM users 
  WHERE email = ?;
`;

export const markUserAsVerified = `
  UPDATE users 
  SET verified = TRUE, verification_token = NULL, verification_expiry = NULL 
  WHERE user_id = ?;
`;

// ! COURSE CONTENT QUERIES
export const getAvailableCoursesOnly = `
  SELECT 
    courses.title, 
    courses.id, 
    courses.description, 
    courses.price, 
    courses.image_url,
    users.username AS instructor_name,
    COUNT(enrollments.id) AS enrollment_count
  FROM courses 
  JOIN users ON courses.instructor_id = users.id
  LEFT JOIN enrollments ON courses.id = enrollments.course_id 
  WHERE courses.published = 'published'
  GROUP BY courses.id;
`;

// ! ADDITIONAL HELPER QUERIES
export const getUserRoleById = `
  SELECT role 
  FROM users 
  WHERE id = ?;
`;

export const checkCourseExists = `
  SELECT id 
  FROM courses 
  WHERE id = ?;
`;

export const getModulesByCourse = `
  SELECT id, title, order_index 
  FROM modules 
  WHERE course_id = ? 
  ORDER BY order_index ASC;
`;

export const getLessonsByModule = `
  SELECT id, title, order_index 
  FROM lessons 
  WHERE module_id = ? 
  ORDER BY order_index ASC;
`;

export const getContentByLesson = `
  SELECT id, content_type, value 
  FROM lesson_content 
  WHERE lesson_id = ?;
`;

//! INSTRUCTOR COURSE MANAGEMENT
export const getInstructorCourseIds = `
  SELECT id 
  FROM courses 
  WHERE instructor_id = ?;
`;

export const checkAnyEnrolledStudents = `
  SELECT COUNT(*) as student_count
  FROM enrollments e
  JOIN courses c ON e.course_id = c.id
  WHERE c.instructor_id = ? 
  AND e.status = 'ACTIVE';
`;

export const deleteAllInstructorCourseContent = `
  DELETE lc FROM lesson_content lc
  JOIN lessons l ON lc.lesson_id = l.id
  JOIN modules m ON l.module_id = m.id
  JOIN courses c ON m.course_id = c.id
  WHERE c.instructor_id = ?;
`;

export const deleteAllInstructorLessons = `
  DELETE l FROM lessons l
  JOIN modules m ON l.module_id = m.id
  JOIN courses c ON m.course_id = c.id
  WHERE c.instructor_id = ?;
`;

export const deleteAllInstructorModules = `
  DELETE m FROM modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.instructor_id = ?;
`;

export const deleteAllInstructorCourses = `
  DELETE FROM courses 
  WHERE instructor_id = ?;
`;

//!  SIMPLE CLEANUP QUERIES
export const deleteUserPurchases = `
  DELETE FROM purchases 
  WHERE user_id = ?;
`;

export const deleteUserSettings = `
  DELETE FROM user_settings 
  WHERE user_id = ?;
`;
