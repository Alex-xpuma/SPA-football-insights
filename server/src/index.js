import express from "express";
import cors from "cors";
import dotenv from "dotenv"; //import .env
import matchesRouter from "./routes/matches.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/matches", matchesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));