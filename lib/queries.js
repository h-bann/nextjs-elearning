export const checkExistingUser = `SELECT user_id FROM users WHERE email = ?;`;

export const createUser = `INSERT INTO users (user_id, role, username, email, password) VALUES (?, ?, ?, ?, ?);`;

export const getUser = `SELECT * FROM users WHERE email = ?;`;

export const getLoggedInUser = `SELECT id, user_id, role, username, email FROM users WHERE user_id = ?;`;

export const checkExistingEmails = `SELECT user_id FROM users WHERE email = ? AND user_id != ?;`;

export const updateUser = `UPDATE users SET username = ?, email = ? WHERE user_id = ?;`;

export const getUserPassword = `SELECT password FROM users WHERE user_id = ?;`;

export const updateUserPassword = `UPDATE users SET password = ? WHERE user_id = ?;`;

export const checkUserRole = `SELECT role FROM users WHERE user_id = ?;`;

export const getInstructorCourse = `SELECT c.*, 
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count
    FROM courses c 
    WHERE c.instructor_id = ?
    ORDER BY c.created_at DESC;`;

export const getEnrolledCourse = `SELECT c.*, 
      u.username as instructor_name,
      (SELECT COUNT(*) FROM progress p 
       JOIN lessons l ON p.lesson_id = l.id 
       WHERE p.completed = true AND l.course_id = c.id AND p.user_id = ?) as completed_lessons,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons
    FROM courses c
    JOIN enrollments e ON e.course_id = c.id
    JOIN users u ON c.instructor_id = u.id
    WHERE e.user_id = ?
    ORDER BY e.created_at DESC;`;

export const insertCourse = `INSERT INTO courses (
        title,
        description,
        price,
        image_url,
        instructor_id,
        published
      ) VALUES (?, ?, ?, ?, ?, ?);`;
