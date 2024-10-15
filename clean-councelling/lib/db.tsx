// db.ts
import mysql from 'mysql2/promise';

export async function getConnection() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'clean_counselling',
    });
    return connection;
}
