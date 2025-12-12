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
 *         description: List of matches with team names, ELO, and averages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   match_date:
 *                     type: string
 *                     format: date
 *                   score_home:
 *                     type: integer
 *                   score_away:
 *                     type: integer
 *                   team_home_id:
 *                     type: integer
 *                   team_home_name:
 *                     type: string
 *                   elo_home:
 *                     type: integer
 *                   home_goals_avg:
 *                     type: number
 *                   home_conceded_avg:
 *                     type: number
 *                   team_away_id:
 *                     type: integer
 *                   team_away_name:
 *                     type: string
 *                   elo_away:
 *                     type: integer
 *                   away_goals_avg:
 *                     type: number
 *                   away_conceded_avg:
 *                     type: number
 *                   elo_home_before:
 *                     type: integer
 */

router.get("/", async (req, res) => {
  try {
    const team = req.query.team;
    let query = `
    SELECT 
      m.id,
      m.match_date,
      m.score_home,
      m.score_away,
      m.team_home_id,
      th.name AS team_home,
      th.elo AS elo_home,
      th.goals_avg AS home_goals_avg,
      th.conceded_avg AS home_conceded_avg,
      m.team_away_id,
      ta.name AS team_away,
      ta.elo AS elo_away,
      ta.goals_avg AS away_goals_avg,
      ta.conceded_avg AS away_conceded_avg,
      m.elo_home_before,
      m.elo_away_before
    FROM matches m
    LEFT JOIN teams th ON m.team_home_id = th.id
    LEFT JOIN teams ta ON m.team_away_id = ta.id
  `;
    const params = [];

    if (team) {
      query += " WHERE th.name ILIKE $1 OR ta.name ILIKE $1";
      params.push(`%${team}%`);
    }

    query += " ORDER BY m.match_date DESC";

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
      `
      SELECT 
        m.id, m.score_home, m.score_away, m.match_date, 
        m.elo_home_before,
        th.id AS team_home_id, th.name AS team_home, th.elo AS elo_home,
        ta.id AS team_away_id, ta.name AS team_away, ta.elo AS elo_away
      FROM matches m
      LEFT JOIN teams th ON m.team_home_id = th.id
      LEFT JOIN teams ta ON m.team_away_id = ta.id
      WHERE th.name ILIKE $1 OR ta.name ILIKE $1
      ORDER BY m.match_date DESC
    `,
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
 *     summary: Add a new match
 *     description: Creates a new FIFA match entry in the database. Home and away teams must be different.
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
 *                 example: "Brazil"
 *               team_away:
 *                 type: string
 *                 example: "Argentina"
 *               score_home:
 *                 type: integer
 *                 example: 2
 *               score_away:
 *                 type: integer
 *                 example: 1
 *               match_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-14"
 *     responses:
 *       201:
 *         description: Match successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 15
 *                 team_home:
 *                   type: string
 *                   example: "Brazil"
 *                 team_away:
 *                   type: string
 *                   example: "Argentina"
 *                 score_home:
 *                   type: integer
 *                   example: 2
 *                 score_away:
 *                   type: integer
 *                   example: 1
 *                 match_date:
 *                   type: string
 *                   format: date
 *                   example: "2025-06-14"
 *       400:
 *         description: Validation error (teams are same or missing fields)
 *       500:
 *         description: Server error
 */

router.post("/", async (req, res) => {
  try {
    const { team_home_id, team_away_id, score_home, score_away, match_date } = req.body;

    // Получаем ELO команды на момент создания матча
    const th = await pool.query("SELECT elo FROM teams WHERE id=$1", [team_home_id]);
    const ta = await pool.query("SELECT elo FROM teams WHERE id=$1", [team_away_id]);
    const elo_home_before = th.rows[0]?.elo || 1500;

    const result = await pool.query(
      `INSERT INTO matches (team_home_id, team_away_id, score_home, score_away, match_date, elo_home_before)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [team_home_id, team_away_id, score_home || null, score_away || null, match_date, elo_home_before]
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
    const { team_home_id, team_away_id } = req.body;

    const th = await pool.query("SELECT elo, goals_avg, conceded_avg FROM teams WHERE id=$1", [team_home_id]);
    const ta = await pool.query("SELECT elo, goals_avg, conceded_avg FROM teams WHERE id=$1", [team_away_id]);

    const payload = {
      elo_home: th.rows[0]?.elo || 1500,
      elo_away: ta.rows[0]?.elo || 1500,
      home_recent_goals_avg: th.rows[0]?.goals_avg || 1.0,
      home_recent_conceded_avg: th.rows[0]?.conceded_avg || 1.0,
      away_recent_goals_avg: ta.rows[0]?.goals_avg || 1.0,
      away_recent_conceded_avg: ta.rows[0]?.conceded_avg || 1.0
    };

    const aiResponse = await axios.post(`${process.env.AI_URL}/predict`, payload);

    res.json({
      input: payload,
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
    const { team_home_id, team_away_id, score_home, score_away, match_date } = req.body;

    //  Получаем текущий ELO команд
    const th = await pool.query("SELECT elo FROM teams WHERE id=$1", [team_home_id]);
    const ta = await pool.query("SELECT elo FROM teams WHERE id=$1", [team_away_id]);

    const elo_home_before = th.rows[0]?.elo || 1500;
    const elo_away_before = ta.rows[0]?.elo || 1500;

    //  Вычисляем результат матча
    let score_home_result = 0.5, score_away_result = 0.5;
    if (score_home > score_away) { score_home_result = 1; score_away_result = 0; }
    else if (score_home < score_away) { score_home_result = 0; score_away_result = 1; }

    // Вычисляем ожидаемый результат
    const expected_home = 1 / (1 + Math.pow(10, (elo_away_before - elo_home_before) / 400));
    const expected_away = 1 / (1 + Math.pow(10, (elo_home_before - elo_away_before) / 400));

    const K = 20;
    const elo_home_after = Math.round(elo_home_before + K * (score_home_result - expected_home));
    const elo_away_after = Math.round(elo_away_before + K * (score_away_result - expected_away));

    const result = await pool.query(
      `UPDATE matches
       SET team_home_id=$1, team_away_id=$2, score_home=$3, score_away=$4, match_date=$5, elo_home_before=$6
       WHERE id=$7 RETURNING *`,
      [team_home_id, team_away_id, score_home, score_away, match_date, elo_home_before, id]
    );

    //  Обновляем ELO команд в таблице teams
    await pool.query(`UPDATE teams SET elo=$1 WHERE id=$2`, [elo_home_after, team_home_id]);
    await pool.query(`UPDATE teams SET elo=$1 WHERE id=$2`, [elo_away_after, team_away_id]);

    res.json({
      match: result.rows[0],
      elo_updated: {
        home: { id: team_home_id, before: elo_home_before, after: elo_home_after },
        away: { id: team_away_id, before: elo_away_before, after: elo_away_after }
      }
    });

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
