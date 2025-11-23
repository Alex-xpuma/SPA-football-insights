import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ConfirmModal({ show, onHide, onConfirm, message }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message || "Are you sure?"}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </Modal.Footer>
    </Modal>
  );
}
