import express from "express";
import pool from "../db.js";
import axios from "axios";

const router = express.Router();

// GET /api/matches
router.get("/", async(req, res) => {
  try {
    const result = await pool.query("SELECT * FROM matches ORDER BY match_date");
    res.json(result.rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST /api/matches
router.post("/", async(req, res) => {
  try {
    const matchData = req.body; // {team_home, team_away, date,...}

    // отправляем данные на AI
    const aiResponse = await axios.post(`${process.env.AI_URL}/predict`, matchData);

    res.json({
      match: matchData,
      prediction: aiResponse.data
    });
  } catch (err) {
    console.error("AI error:", err.message);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

export default router;