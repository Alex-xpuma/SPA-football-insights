import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";

export default function MatchForm({ initial, onSave, onCancel }) {
  const [teamHome, setTeamHome] = useState("");
  const [teamAway, setTeamAway] = useState("");
  const [scoreHome, setScoreHome] = useState("");
  const [scoreAway, setScoreAway] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (initial) {
      setTeamHome(initial.team_home || "");
      setTeamAway(initial.team_away || "");
      setScoreHome(initial.score_home ?? "");
      setScoreAway(initial.score_away ?? "");
      setDate(initial.match_date ? initial.match_date.split("T")[0] : "");
    } else {
      setTeamHome(""); setTeamAway(""); setScoreHome(""); setScoreAway(""); setDate("");
    }
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      team_home: teamHome,
      team_away: teamAway,
      score_home: scoreHome === "" ? null : Number(scoreHome),
      score_away: scoreAway === "" ? null : Number(scoreAway),
      match_date: date
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2">
        <Form.Label>Home team</Form.Label>
        <Form.Control value={teamHome} onChange={(e)=>setTeamHome(e.target.value)} required />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Away team</Form.Label>
        <Form.Control value={teamAway} onChange={(e)=>setTeamAway(e.target.value)} required />
      </Form.Group>
      <Form.Group className="mb-2 d-flex gap-2">
        <div style={{flex:1}}>
          <Form.Label>Home score</Form.Label>
          <Form.Control value={scoreHome} onChange={(e)=>setScoreHome(e.target.value)} type="number" />
        </div>
        <div style={{flex:1}}>
          <Form.Label>Away score</Form.Label>
          <Form.Control value={scoreAway} onChange={(e)=>setScoreAway(e.target.value)} type="number" />
        </div>
      </Form.Group>
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
