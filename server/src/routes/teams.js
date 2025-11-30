import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/teams — получить все команды
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teams ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/teams — добавить новую команду
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      "INSERT INTO teams (name) VALUES ($1) RETURNING *",
      [name]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
