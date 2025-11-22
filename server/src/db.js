import pg from "pg";
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'yourpassword',
  host: process.env.DB_HOST || 'postgres-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fifa',
});

pool.on('connect', () => {
  console.log('Connected to Postgres database');
});

export default pool;