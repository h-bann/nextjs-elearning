export const checkExistingUser = `SELECT user_id FROM users WHERE email = ?;`;

export const createUser = `INSERT INTO users (user_id, role, username, email, password) VALUES (?, ?, ?, ?, ?);`;

export const getUser = `SELECT * FROM users WHERE email = ?;`;

export const getLoggedInUser = `SELECT user_id, role, username, email FROM users WHERE user_id = ?;`;

export const checkExistingEmails = `SELECT user_id FROM users WHERE email = ? AND user_id != ?;`;

export const updateUser = `UPDATE users SET username = ?, email = ? WHERE user_id = ?;`;

export const getUserPassword = `SELECT password FROM users WHERE user_id = ?;`;

export const updateUserPassword = `UPDATE users SET password = ? WHERE user_id = ?;`;
