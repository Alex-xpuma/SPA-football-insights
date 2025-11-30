import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { createMatch, updateMatch } from "../api";
import axios from "axios";


export default function MatchForm({ initial, onSave, onCancel }) {
  const [teams, setTeams] = useState([]);
  const [teamHome, setTeamHome] = useState("");
  const [teamAway, setTeamAway] = useState("");
  const [scoreHome, setScoreHome] = useState("");
  const [scoreAway, setScoreAway] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    // получаем список команд
    axios.get((process.env.REACT_APP_API_URL || "http://localhost:5000/api") + "/teams")
      .then(res => setTeams(res.data))
      .catch(err => {
        console.error("Failed to fetch teams", err);
        setTeams([]);
      });
  }, []);

  useEffect(() => {
    if (initial) {
      // initial может быть либо match, либо { match: ... } — подстраховка
      const m = initial.match ? initial.match : initial;
      setTeamHome(m.team_home_id ?? "");
      setTeamAway(m.team_away_id ?? "");
      setScoreHome(m.score_home ?? "");
      setScoreAway(m.score_away ?? "");
      setDate(m.match_date ? m.match_date.split("T")[0] : "");
    } else {
      setTeamHome(""); setTeamAway(""); setScoreHome(""); setScoreAway(""); setDate("");
    }
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      team_home_id: Number(teamHome),
      team_away_id: Number(teamAway),
      score_home: scoreHome === "" ? null : Number(scoreHome),
      score_away: scoreAway === "" ? null : Number(scoreAway),
      match_date: date
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2">
        <Form.Label>Home team</Form.Label>
        <Form.Select value={teamHome} onChange={(e)=>setTeamHome(e.target.value)} required>
          <option value="">Select home team</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Away team</Form.Label>
        <Form.Select value={teamAway} onChange={(e)=>setTeamAway(e.target.value)} required>
          <option value="">Select away team</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Form.Select>
      </Form.Group>

      <div className="d-flex gap-2 mb-2">
        <div style={{flex:1}}>
          <Form.Label>Home score</Form.Label>
          <Form.Control value={scoreHome} onChange={(e)=>setScoreHome(e.target.value)} type="number" />
        </div>
        <div style={{flex:1}}>
          <Form.Label>Away score</Form.Label>
          <Form.Control value={scoreAway} onChange={(e)=>setScoreAway(e.target.value)} type="number" />
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
