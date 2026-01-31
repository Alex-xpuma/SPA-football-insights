import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api"; 

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export const getMatches = (team) =>
  api.get("/matches", { params: team ? { team } : {} }).then(res => res.data);

export const getMatchesByCountry = (country) =>
  api.get(`/matches/country/${encodeURIComponent(country)}`).then(res => res.data);

export const createMatch = (payload) =>
  api.post("/matches", payload).then(res => res.data);

export const updateMatch = (id, payload) =>
  api.put(`/matches/${id}`, payload).then(res => res.data);

export const deleteMatch = (id) =>
  api.delete(`/matches/${id}`).then(res => res.data);

export const predictAI = (payload) =>
  api.post("/matches/predict", payload).then(res => res.data);
