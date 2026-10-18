import pool from "./db.js";

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DB connected:", res.rows[0]);
    process.exit(0); // выходим после проверки
  } catch (err) {
    console.error("DB error:", err);
    process.exit(1); // ошибка подключения
  }
}

testConnection();
