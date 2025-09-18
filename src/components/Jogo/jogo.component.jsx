import React, { useState, useEffect, useCallback } from "react";
import Tabuleiro from "../Tabuleiro/tabuleiro.component";
import "./style.css";

function Jogo({ onLevelChange }) {
  const [settings, setSettings] = useState({
    height: 9,
    width: 9,
    mines: 10,
  });

  const [mines_conta, setMines] = useState(settings.mines);
  const [cronometro, setCronometro] = useState(0);
  const [resultado, setResultado] = useState(null);

  // Função para recomeçar o jogo
  const restartGame = () => {
    // Recarrega a página
    window.location.reload();
  };

  // Função para lidar com a mudança de seleção
  const handleSelectChange = useCallback((event) => {
    const value = event.target.value;
    setSettings(prevSettings => {
      let newSettings;
      switch (value) {
        case 'basic':
          newSettings = { height: 9, width: 9, mines: 10, level: 'basic' };
          break;
        case 'intermediate':
          newSettings = { height: 16, width: 16, mines: 40, level: 'intermediate' };
          break;
        case 'advanced':
          newSettings = { height: 30, width: 16, mines: 99, level: 'advanced' };
          break;
        default:
          newSettings = prevSettings;
          break;
      }
      onLevelChange(newSettings.level);
      // Salva o nível selecionado no localStorage
      localStorage.setItem('selectedLevel', value);
      return newSettings;
    });
  }, [onLevelChange]);

// Recupera o nível selecionado do localStorage quando a página for carregada
useEffect(() => {
  const selectedLevel = localStorage.getItem('selectedLevel');
  if (selectedLevel) {
    handleSelectChange({ target: { value: selectedLevel } });
  }
}, [handleSelectChange]);

  return (
    <div className="game">
      <div className="control-buttons">
        <form>
          <label>Nível de Jogo</label>
          <select onChange={handleSelectChange} value={settings.level}>
            <option value="basic">Básico (9x9, 10 minas)</option>
            <option value="intermediate">Intermédio (16x16, 40 minas)</option>
            <option value="advanced">Avançado (30x16, 99 minas)</option>
          </select>
        </form>
      </div>
      <div className="control-buttons">
        <button onClick={restartGame}>Recomeçar</button>
        <label className="label mines-label">Minas: {mines_conta}</label>
        <label className="label time-label">Tempo: {cronometro}</label>
      </div>
      <div className="resultado-container">
        <label className={`resultado-label ${resultado}`}>
          {resultado}
        </label>
      </div>
      <Tabuleiro
        height={settings.height}
        width={settings.width}
        mines={settings.mines}
        encontra_minas={setMines}
        tempo_decorrido={setCronometro}
        fimjogo={setResultado}
      />
    </div>
  );
};

export default Jogo;
