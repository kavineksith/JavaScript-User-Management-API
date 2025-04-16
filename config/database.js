const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'secure_crud',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable SSL for production
    ...(process.env.NODE_ENV === 'production' && {
        ssl: {
            rejectUnauthorized: true
        }
    })
});

// Simple query function with SQL injection protection
const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
};

module.exports = {
    pool,
    query
};