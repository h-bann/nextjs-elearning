export const checkExistingUser = `SELECT user_id FROM users WHERE email = ?;`;

export const createUser = `INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?);`;
