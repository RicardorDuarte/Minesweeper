import React from "react";
import PropTypes from "prop-types";
import "./style.css";

function Celulas({ value, onClick, cMenu }) {

  const getValue = () => {
    if (!value.isRevealed) {
      if (value.isFlagged) {
        return "🚩";
      } else if (value.isUnknown) {
        return "?";
      }
      return null;
    } else if (value.isMine) {
      return "💣";
    } else if (value.isEmpty) {
      return "";
    }
    return value.n;
  };

  // Definir a cor baseada no valor da célula
  const getCorClasse = () => {
    if (!value.isRevealed) {
      return "";
    }
    switch (value.n) {
      case 1:
        return " is-value-1";
      case 2:
        return " is-value-2";
      case 3:
        return " is-value-3";
      case 4:
        return " is-value-4";
      case 5:
        return " is-value-4";
      default:
        return " is-value-4"; // para numeros que possam aparecer maiores
    }
  };

  // para aparecer o css suposto, icones de mina
  const className =
    "celula" +
    (value.isRevealed ? "" : " hidden") +
    (value.isMine ? " is-mine" : "") +
    (value.isClicked ? " is-clicked" : "") +
    (value.isEmpty ? " is-empty" : "") +
    (value.isUnknown ? " is-unknown" : "") +
    (value.isFlagged ? " is-flag" : "") +
    getCorClasse();

  return (
    <div
      className={className}
      onClick={onClick}
      onContextMenu={cMenu}
    >
      {getValue()}
    </div>
  );
};

const cellItemShape = {
  x: PropTypes.number,
  y: PropTypes.number,
  n: PropTypes.number,
  isRevealed: PropTypes.bool,
  isMine: PropTypes.bool,
  isFlagged: PropTypes.bool
};

Celulas.propTypes = {
  value: PropTypes.shape(cellItemShape).isRequired,
  onClick: PropTypes.func.isRequired,
  cMenu: PropTypes.func.isRequired
};

export default Celulas;
