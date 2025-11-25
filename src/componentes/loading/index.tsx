import React from "react";
import { Spinner } from "react-bootstrap";
import "./index.css";

interface Props {
  show: boolean;
  message?: string;
}

const Loading = ({ show, message = "Carregando..." }: Props) => {
  if (!show) return null;

  return (
    <div className="loading-backdrop">
      <div className="loading-box">
        <Spinner animation="border" variant="success" />
        <span className="loading-message">{message}</span>
      </div>
    </div>
  );
};

export default Loading;