// app/lib/db.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Adjust this limit as per your requirement
    queueLimit: 0
});

export async function getConnection() {
    return await pool.getConnection();
}

// Utility function to handle queries
export async function query(sql: string, params?: any[]) {
    const connection = await getConnection();
    try {
        const [results] = await connection.execute(sql, params);
        return results;
    } finally {
        connection.release();
    }
}

// Utility function to handle transactions
export async function transaction(callback: (conn: mysql.PoolConnection) => Promise<void>) {
    const connection = await getConnection();
    await connection.beginTransaction();

    try {
        await callback(connection);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
