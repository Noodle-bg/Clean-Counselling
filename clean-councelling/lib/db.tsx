// lib/db.tsx

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

export async function getConnection() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'clean_counselling',
    });
    return connection;
}
