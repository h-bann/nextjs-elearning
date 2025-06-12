import mysql from "mysql2";

// ! When using local database
const pool = mysql
  .createPool({
    host:
      process.env.ENV_TYPE === "production"
        ? process.env.DB_HOST
        : process.env.DB_LOCALHOST,
    user:
      process.env.ENV_TYPE === "production"
        ? process.env.DB_USER
        : process.env.DB_LOCALUSER,
    password:
      process.env.ENV_TYPE === "production"
        ? process.env.DB_PASSWORD
        : process.env.DB_LOCALPASSWORD,
    database:
      process.env.ENV_TYPE === "production"
        ? process.env.DB_DATABASE
        : process.env.DB_LOCALDATABASE,
    port: process.env.ENV_TYPE === "production" ? process.env.DB_PORT : null,
    waitForConnections: true, // Wait for a connection to be available if the pool is exhausted
    connectionLimit: 1000, // Maximum number of connections in the pool
    queueLimit: 0,
  })
  .promise();

export default async function mySQL(query, params) {
  const connection = await pool.getConnection(); // Manually get a connection
  try {
    const [results] = await connection.query(query, params);
    return results;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    connection.release(); // Release the connection back to the pool
  }
}
