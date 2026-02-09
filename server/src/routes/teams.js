import express from "express";
import pool from "../db.js";
import redisClient from "../redis/redisClient.js";

const router = express.Router();

/* -----------------------------------
   GET /api/teams — Get all teams
----------------------------------- */
/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of all teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get("/", async (req, res) => {
  try {
    const cacheKey = "teams:all";

    // check Redis
    const cachedTeams = await redisClient.get(cacheKey);
    if (cachedTeams) {
      console.log("Teams from Redis cache");
      return res.json(JSON.parse(cachedTeams));
    }

    const result = await pool.query("SELECT * FROM teams ORDER BY name ASC");
    console.log("not redis");

    await redisClient.set(cacheKey, JSON.stringify(result.rows), {
      EX: 60
    });

    res.json(result.rows);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* -----------------------------------
   POST /api/teams — Add new team
----------------------------------- */
/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Add a new team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Brazil
 *     responses:
 *       200:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      "INSERT INTO teams (name) VALUES ($1) RETURNING *",
      [name]
    );

    await redisClient.del("teams:all");
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
