import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, ProgressBar } from "react-bootstrap";
import { predictAI } from "../api";

export default function AIPredictModal({ show, onHide, match, onPredict }) {
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
      // Автозаполнение — берем значения, которые возвращает бэкенд (elo и avg)
      setEloHome(match.elo_home ?? match.elo_home_before ?? 1500);
      setEloAway(match.elo_away ?? 1500);
      setHomeGoalsAvg(match.home_goals_avg ?? 1.0);
      setHomeConcededAvg(match.home_conceded_avg ?? 1.0);
      setAwayGoalsAvg(match.away_goals_avg ?? 1.0);
      setAwayConcededAvg(match.away_conceded_avg ?? 1.0);
      setResult(null);
    } else {
      // reset
      setEloHome(1500); setEloAway(1500); setHomeGoalsAvg(1.0); setHomeConcededAvg(1.0); setAwayGoalsAvg(1.0); setAwayConcededAvg(1.0);
      setResult(null);
    }
  }, [match, show]);

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);

    const payload = {
      team_home_id: match?.team_home_id,
      team_away_id: match?.team_away_id,
      elo_home: Number(eloHome),
      elo_away: Number(eloAway),
      home_recent_goals_avg: Number(homeGoalsAvg),
      home_recent_conceded_avg: Number(homeConcededAvg),
      away_recent_goals_avg: Number(awayGoalsAvg),
      away_recent_conceded_avg: Number(awayConcededAvg)
    };

    try {
      const data = onPredict ? await onPredict(payload) : await predictAI(payload);
      console.log("AI RAW DATA:", data);
      // ожидаем структуру { input:..., prediction: { prediction: n, probabilities: [...] } }
      const pred = data?.prediction?.prediction ?? data?.prediction ?? null;
      const probs = data?.prediction?.probabilities ?? data?.probabilities ?? null;

      setResult({ prediction: pred, probabilities: probs });
    } catch (err) {
      console.error(err);
      alert("Error requesting AI");
    } finally {
      setLoading(false);
    }
  };

  const CLASS_LABELS = ["Home win", "Draw", "Away win"];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>AI Prediction {match ? ` — ${match.team_home_name} vs ${match.team_away_name}` : ""}</Modal.Title>
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

          <div className="d-flex gap-2 mb-2">
            <Form.Group style={{flex:1}}>
              <Form.Label>Home - recent goals avg</Form.Label>
              <Form.Control value={homeGoalsAvg} onChange={e => setHomeGoalsAvg(e.target.value)} type="number" step="0.1" />
            </Form.Group>
            <Form.Group style={{flex:1}}>
              <Form.Label>Home - recent conceded avg</Form.Label>
              <Form.Control value={homeConcededAvg} onChange={e => setHomeConcededAvg(e.target.value)} type="number" step="0.1" />
            </Form.Group>
          </div>

          <div className="d-flex gap-2 mb-2">
            <Form.Group style={{flex:1}}>
              <Form.Label>Away - recent goals avg</Form.Label>
              <Form.Control value={awayGoalsAvg} onChange={e => setAwayGoalsAvg(e.target.value)} type="number" step="0.1" />
            </Form.Group>
            <Form.Group style={{flex:1}}>
              <Form.Label>Away - recent conceded avg</Form.Label>
              <Form.Control value={awayConcededAvg} onChange={e => setAwayConcededAvg(e.target.value)} type="number" step="0.1" />
            </Form.Group>
          </div>
        </Form>

        <div className="my-3">
          {loading && <div className="text-center"><Spinner animation="border" /></div>}

          {result && (
            <>
              <h6>Result</h6>
              <p>
                Predicted: <strong>{result.prediction !== null ? CLASS_LABELS[result.prediction] ?? result.prediction : "—"}</strong>
              </p>

              {Array.isArray(result.probabilities) ? result.probabilities.map((p, i) => {
                const pct = Math.round(Number(p) * 10000) / 100;
                const isMax = p === Math.max(...result.probabilities);
                return (
                  <div key={i} style={{ padding: 6, borderRadius: 6, background: isMax ? "#e9ffe9" : "transparent", marginBottom: 8 }}>
                    <div className="d-flex justify-content-between">
                      <div style={{ fontWeight: isMax ? 600 : "normal", color: isMax ? "green" : "inherit" }}>
                        {CLASS_LABELS[i] ?? `Class ${i}`}
                      </div>
                      <div style={{ fontWeight: isMax ? 600 : "normal", color: isMax ? "green" : "inherit" }}>
                        {isNaN(p) ? "—" : `${pct}%`}
                      </div>
                    </div>
                    <ProgressBar now={isNaN(p) ? 0 : Number(p) * 100} variant={isMax ? "success" : "primary"} />
                  </div>
                );
              }) : <div>No probabilities returned</div>}
            </>
          )}
        </div>
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
