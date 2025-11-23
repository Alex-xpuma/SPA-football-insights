import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Spinner } from "react-bootstrap";
import { getMatches, createMatch, updateMatch, deleteMatch, predictAI } from "../api";
import MatchForm from "./MatchForm";
import AIPredictModal from "./AIPredictModal";
import ConfirmModal from "./ConfirmModal";

export default function MatchesTable() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMatch, setEditMatch] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedMatchForAI, setSelectedMatchForAI] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchMatches = async (team) => {
    setLoading(true);
    try {
      const data = await getMatches(team);
      setMatches(data);
    } catch (err) {
      console.error(err);
      alert("Error getting matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleFilter = (e) => setFilter(e.target.value);

  const applyFilter = () => fetchMatches(filter.trim() || undefined);

  const handleAdd = () => {
    setEditMatch(null);
    setShowForm(true);
  };

  const handleEdit = (m) => {
    setEditMatch(m);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMatch(deleteId);
      setMatches((prev) => prev.filter((x) => x.id !== deleteId));
    } catch (err) {
      console.error(err);
      alert("Error deleting");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleSave = async (payload) => {
    try {
      if (editMatch) {
        const updated = await updateMatch(editMatch.id, payload);
        setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      } else {
        const created = await createMatch(payload);
        setMatches((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Error saving");
    }
  };

  const openAIModal = (match) => {
    setSelectedMatchForAI(match);
    setShowAIModal(true);
  };

  return (
    <div className="container mt-4">
      <h3>Matches</h3>

      <div className="d-flex mb-3 gap-2">
        <Form.Control
          style={{ maxWidth: 300 }}
          placeholder="Filter by team..."
          value={filter}
          onChange={handleFilter}
          onKeyDown={(e) => e.key === "Enter" && applyFilter()}
        />
        <Button variant="primary" onClick={applyFilter}>Apply</Button>
        <Button variant="success" onClick={handleAdd}>Add match</Button>
      </div>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Home</th>
              <th>Away</th>
              <th>Score</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.team_home}</td>
                <td>{m.team_away}</td>
                <td>{m.score_home ?? "-"} : {m.score_away ?? "-"}</td>
                <td>{new Date(m.match_date).toLocaleDateString()}</td>
                <td>
                  <Button size="sm" variant="outline-primary" onClick={() => handleEdit(m)}>Edit</Button>{" "}
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(m.id)}>Delete</Button>{" "}
                  <Button size="sm" variant="outline-secondary" onClick={() => openAIModal(m)}>Get prediction</Button>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr><td colSpan="6" className="text-center">No matches</td></tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showForm} onHide={() => setShowForm(false)}>
        <Modal.Header closeButton><Modal.Title>{editMatch ? "Edit match" : "Add match"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <MatchForm initial={editMatch} onCancel={() => setShowForm(false)} onSave={handleSave} />
        </Modal.Body>
      </Modal>

      <AIPredictModal
        show={showAIModal}
        onHide={() => setShowAIModal(false)}
        match={selectedMatchForAI}
        onPredict={(payload) => {
          // optional: if you want to save prediction to db, do it here
          return predictAI(payload);
        }}
      />
      <ConfirmModal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete match?"
        message="Are you sure you want to delete this match?"
      />
    </div>
  );
}
