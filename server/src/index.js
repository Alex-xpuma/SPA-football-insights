import express from "express";
import axios from "axios";
import cors from "cors";

import dotenv from "dotenv"; //import .env
import waitPort from 'wait-port';
import matchesRouter from "./routes/matches.js";

import setupSwagger from "./swagger.js";
import teamsRoutes from "./routes/teams.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/teams", teamsRoutes);

const PORT = process.env.PORT || 5000;
const AI_URL = process.env.AI_URL || 'http://ai:5000';
const DB_HOST = process.env.DB_HOST || 'postgres-db';
const DB_PORT = process.env.DB_PORT || 5432;

async function startServer() {
    console.log('Waiting for Postgres and AI services...');
  
    await waitPort({ host: DB_HOST, port: Number(DB_PORT), timeout: 30000 });
    await waitPort({ host: 'ai', port: 5000, timeout: 30000 });
  
    console.log('Dependencies ready. Starting server...');

    // --- AI PREDICT ENDPOINT HERE ---
    app.post("/api/predict", async (req, res) => {
        try {
            const aiResponse = await axios.post(${AI_URL}/predict, req.body);
            res.json(aiResponse.data);
        } catch (error) {
            console.error("AI service error:", error.message);
            res.status(500).json({ error: "AI service unavailable" });
        }
    });

    // routes
    app.use("/api/matches", matchesRouter);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

setupSwagger(app);
startServer();

