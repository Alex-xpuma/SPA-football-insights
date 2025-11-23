import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { predictAI } from "../api";

export default function AIPredictModal({ show, onHide, match, onPredict }) {
  // default feature values; можешь заменить на реальные расчёты
  const [eloHome, setEloHome] = useState(1500);
  const [eloAway, setEloAway] = useState(1500);
  const [homeGoalsAvg, setHomeGoalsAvg] = useState(1.0);
  const [homeConcededAvg, setHomeConcededAvg] = useState(1.0);
  const [awayGoalsAvg, setAwayGoalsAvg] = useState(1.0);
  const [awayConcededAvg, setAwayConcededAvg] = useState(1.0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (match) {
      // можно автоматически заполнить какие-то поля например по названию команд
      // оставим дефолты
      setResult(null);
    }
  }, [match]);

  const handlePredict = async () => {
    const payload = {
      elo_home: Number(eloHome),
      elo_away: Number(eloAway),
      home_recent_goals_avg: Number(homeGoalsAvg),
      home_recent_conceded_avg: Number(homeConcededAvg),
      away_recent_goals_avg: Number(awayGoalsAvg),
      away_recent_conceded_avg: Number(awayConcededAvg)
    };

    setLoading(true);
    setResult(null);
    try {
      const data = onPredict ? await onPredict(payload) : await predictAI(payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error request AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>AI Prediction {match ? `: ${match.team_home} vs ${match.team_away}` : ""}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>ELO home</Form.Label>
            <Form.Control value={eloHome} onChange={e => setEloHome(e.target.value)} type="number" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>ELO away</Form.Label>
            <Form.Control value={eloAway} onChange={e => setEloAway(e.target.value)} type="number" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Home - recent goals avg</Form.Label>
            <Form.Control value={homeGoalsAvg} onChange={e=>setHomeGoalsAvg(e.target.value)} type="number" step="0.1" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Home - recent conceded avg</Form.Label>
            <Form.Control value={homeConcededAvg} onChange={e=>setHomeConcededAvg(e.target.value)} type="number" step="0.1" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Away - recent goals avg</Form.Label>
            <Form.Control value={awayGoalsAvg} onChange={e=>setAwayGoalsAvg(e.target.value)} type="number" step="0.1" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Away - recent conceded avg</Form.Label>
            <Form.Control value={awayConcededAvg} onChange={e=>setAwayConcededAvg(e.target.value)} type="number" step="0.1" />
          </Form.Group>
        </Form>

        {loading && <div className="text-center my-2"><Spinner animation="border" /></div>}

        {result && (
          <div className="mt-3">
            <h6>Prediction</h6>
            <pre>{JSON.stringify(result, null, 2)}</pre>
            {/* Можно красиво отобразить probabilities */}
            {result.prediction !== undefined && result.probabilities && (
              <div>
                <p>Predicted class: {result.prediction}</p>
                <p>Probabilities: {result.probabilities.join(", ")}</p>
              </div>
            )}
          </div>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handlePredict} disabled={loading}>
          {loading ? "Predicting..." : "Get prediction"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
