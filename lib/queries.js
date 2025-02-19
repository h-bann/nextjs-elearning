export const checkExistingUser = `SELECT user_id FROM users WHERE email = ?;`;

export const createUser = `INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?);`;

export const getUser = `SELECT * FROM users WHERE email = ?;`;

export const getLoggedInUser = `SELECT user_id, username, email FROM users WHERE user_id = ?;`;
