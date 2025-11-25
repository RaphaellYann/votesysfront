import React from "react";
import { TrophyFill } from "react-bootstrap-icons"; // Removi AwardFill
import "./index.css";

interface TrofeusProps {
  posicao: number;
}

const Trofeus = ({ posicao }: TrofeusProps) => {
  const renderIcon = () => {
    switch (posicao) {
      case 1:
        return (
          <div className="trofeu-wrapper">
            {/* 1º Lugar: Troféu Dourado */}
            <TrophyFill className="gold" />
            <span className="trofeu-numero">1</span>
          </div>
        );
      case 2:
        return (
          <div className="trofeu-wrapper">
            {/* 2º Lugar: Troféu Prateado */}
            <TrophyFill className="silver" />
            <span className="trofeu-numero">2</span>
          </div>
        );
      case 3:
        return (
          <div className="trofeu-wrapper">
            {/* 3º Lugar: Troféu Bronze */}
            <TrophyFill className="bronze" />
            <span className="trofeu-numero">3</span>
          </div>
        );
      default:
        // Do 4º em diante: Círculo com número
        return <span className="numero-normal">{posicao}º</span>;
    }
  };

  return <div className="trofeus-container">{renderIcon()}</div>;
};

export default Trofeus;