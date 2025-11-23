import express from "express";
import pool from "../db.js";
import axios from "axios";

const router = express.Router();

/* ---------------------------
   GET all matches + optional team filter
--------------------------- */
/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches (optionally filter by team)
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *         description: Filter by team name
 *     responses:
 *       200:
 *         description: Returns a list of matches
 */

router.get("/", async (req, res) => {
  try {
    const team = req.query.team;
    let query = "SELECT * FROM matches";
    let params = [];

    if (team) {
      query += " WHERE team_home ILIKE $1 OR team_away ILIKE $1";
      params = [`%${team}%`];
    }

    query += " ORDER BY match_date DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ---------------------------
   GET matches by country
--------------------------- */
/**
 * @swagger
 * /api/matches/country/{country}:
 *   get:
 *     summary: Get matches for a specific country
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         description: Country name
 *     responses:
 *       200:
 *         description: List of matches for that country
 */

router.get("/country/:country", async (req, res) => {
  try {
    const country = req.params.country;

    const result = await pool.query(
      "SELECT * FROM matches WHERE team_home ILIKE $1 OR team_away ILIKE $1 ORDER BY match_date DESC",
      [`%${country}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ---------------------------
   POST – Add match to DB
--------------------------- */
/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Add a new match to the database
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_home
 *               - team_away
 *               - match_date
 *             properties:
 *               team_home:
 *                 type: string
 *               team_away:
 *                 type: string
 *               score_home:
 *                 type: integer
 *               score_away:
 *                 type: integer
 *               match_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Match added successfully
 */

router.post("/", async (req, res) => {
  try {
    const { team_home, team_away, score_home, score_away, match_date } = req.body;

    const result = await pool.query(
      `INSERT INTO matches (team_home, team_away, score_home, score_away, match_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [team_home, team_away, score_home || null, score_away || null, match_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ---------------------------
   POST — Predict with AI
--------------------------- */
/**
 * @swagger
 * /api/matches/predict:
 *   post:
 *     summary: Get AI prediction for the match
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               elo_home:
 *                 type: number
 *               elo_away:
 *                 type: number
 *               home_recent_goals_avg:
 *                 type: number
 *               home_recent_conceded_avg:
 *                 type: number
 *               away_recent_goals_avg:
 *                 type: number
 *               away_recent_conceded_avg:
 *                 type: number
 *     responses:
 *       200:
 *         description: AI returns prediction probabilities
 */

router.post("/predict", async (req, res) => {
  try {
    const matchData = req.body;

    const aiResponse = await axios.post(`${process.env.AI_URL}/predict`, matchData);

    res.json({
      input: matchData,
      prediction: aiResponse.data
    });
  } catch (err) {
    console.error("AI error:", err.message);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

/* ---------------------------
   PUT update match
--------------------------- */
/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Update an existing match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Match updated
 */
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { team_home, team_away, score_home, score_away, match_date } = req.body;

    const result = await pool.query(
      `UPDATE matches
       SET team_home=$1, team_away=$2, score_home=$3, score_away=$4, match_date=$5
       WHERE id=$6 RETURNING *`,
      [team_home, team_away, score_home, score_away, match_date, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ---------------------------
   DELETE match
--------------------------- */
/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Delete a match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Match deleted
 */

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query("DELETE FROM matches WHERE id=$1", [id]);

    res.json({ deleted: true });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
