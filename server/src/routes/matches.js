import express from "express";
const router = express.Router();

// GET /api/matches
router.get("/", (req, res) => {
  res.json({ message: "List of matches will be here" });
});

// POST /api/matches
router.post("/", (req, res) => {
  res.json({ message: "Add match functionality will be here" });
});

export default router;