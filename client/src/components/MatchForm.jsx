import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { createMatch, updateMatch } from "../api";
import axios from "axios";


export default function MatchForm({ initial, onSave, onCancel }) {
  const [teams, setTeams] = useState([]);

  const [teamHome, setTeamHome] = useState("");
  const [teamAway, setTeamAway] = useState("");

  const [newHomeTeam, setNewHomeTeam] = useState("");
  const [newAwayTeam, setNewAwayTeam] = useState("");

  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);
  const [date, setDate] = useState("");

  const API = (process.env.REACT_APP_API_URL || "http://localhost:5000/api");

  useEffect(() => {
    // получаем список команд
    axios.get(`${API}/teams`)
      .then(res => setTeams(res.data))
      .catch(err => {
        console.error("Failed to fetch teams", err);
        setTeams([]);
      });
  }, []);

  useEffect(() => {
    if (initial) {
      const m = initial.match ? initial.match : initial;
      setTeamHome(m.team_home_id ?? "");
      setTeamAway(m.team_away_id ?? "");
      setScoreHome(m.score_home ?? 0);
      setScoreAway(m.score_away ?? 0);
      setDate(m.match_date ? m.match_date.split("T")[0] : "");
    } else {
      setTeamHome(""); setTeamAway(""); setScoreHome(0); setScoreAway(0); setDate("");
    }
  }, [initial]);

  async function createTeamIfNeeded(selectedId, newName) {
    if (selectedId !== "new") return selectedId; // выбрана существующая команда

    if (!newName.trim()) {
      alert("Введите название новой команды");
      return null;
    }

    try {
      const res = await axios.post(`${API}/teams`, { name: newName });
      return res.data.id; // API должен вернуть созданную команду
    } catch (err) {
      console.error(err);
      alert("Ошибка создания команды");
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (teamsEqual) {
      alert("Home team and Away team must be different!");
      return; // прекращаем сохранение
    }

    // Создаём новые команды, если нужно
    const homeId = await createTeamIfNeeded(teamHome, newHomeTeam);
    const awayId = await createTeamIfNeeded(teamAway, newAwayTeam);

    if (!homeId || !awayId) return;

    if (homeId === awayId) {
      alert("Home team and Away team must be different!");
      return;
    }

    // гарантия, что не пойдёт отрицательное число
    const safeHome = Math.max(0, Number(scoreHome));
    const safeAway = Math.max(0, Number(scoreAway));

    onSave({
      team_home_id: Number(homeId),
      team_away_id: Number(awayId),
      score_home: safeHome,
      score_away: safeAway,
      match_date: date
    });
  };

  const teamsEqual = (
    teamHome !== "new" &&
    teamAway !== "new" &&
    teamHome === teamAway
  ) ||
  (
    teamHome === "new" &&
    teamAway === "new" &&
    newHomeTeam.trim() &&
    newAwayTeam.trim() &&
    newHomeTeam.trim().toLowerCase() === newAwayTeam.trim().toLowerCase()
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2">
        <Form.Label>Home team</Form.Label>
        <Form.Select value={teamHome} onChange={(e)=>setTeamHome(e.target.value)} required>
          <option value="">Select home team</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          <option value="new">➕ Add new team…</option>
        </Form.Select>
        {teamHome === "new" && (
          <Form.Control
            className="mt-2"
            placeholder="Enter new team name"
            value={newHomeTeam}
            onChange={(e) => setNewHomeTeam(e.target.value)}
            required
          />
        )}
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Away team</Form.Label>
        <Form.Select value={teamAway} onChange={(e)=>setTeamAway(e.target.value)} required>
          <option value="">Select away team</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          <option value="new">➕ Add new team…</option>
        </Form.Select>
        {teamAway === "new" && (
          <Form.Control
            className="mt-2"
            placeholder="Enter new team name"
            value={newAwayTeam}
            onChange={(e) => setNewAwayTeam(e.target.value)}
            required
          />
        )}
      </Form.Group>

      {teamsEqual && (
        <div style={{ color: "red", fontSize: "0.9rem" }}>
          Home team and Away team must be different.
        </div>
      )}

      <div className="d-flex gap-2 mb-2">
        <div style={{flex:1}}>
          <Form.Label>Home score</Form.Label>
          <Form.Control type="number"
            min="0" value={scoreHome} onWheel={(e) => e.target.blur()} onChange={(e)=>setScoreHome(e.target.value)} />
        </div>
        <div style={{flex:1}}>
          <Form.Label>Away score</Form.Label>
          <Form.Control type="number"
            min="0" value={scoreAway} onWheel={(e) => e.target.blur()} onChange={(e)=>setScoreAway(e.target.value)}  />
        </div>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Match date</Form.Label>
        <Form.Control type="date" value={date} onChange={(e)=>setDate(e.target.value)} required />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">Save</Button>
      </div>
    </Form>
  );
}
