import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Celula from "../Celulas/celulas.component";
import "./style.css";

const createGridCell = (y, x, isMine) => ({
  x,
  y,
  n: 0,
  isMine,
  isRevealed: false,
  isFlagged: false,
  isUnknown: false,
  isClicked: false,
  get isEmpty() {
    return this.n === 0 && !this.isMine;
  }
});

function Tabuleiro({ height, width, mines, encontra_minas, tempo_decorrido, fimjogo }) {

  const [grid, setGrid] = useState([]);
  const [minesCount, setMinesCount] = useState(mines);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const getNeighbours = useCallback((grid, y, x) => {
    const neighbours = [];
    const currentRow = grid[y];
    const prevRow = grid[y - 1];
    const nextRow = grid[y + 1];

    if (currentRow[x - 1]) neighbours.push(currentRow[x - 1]);
    if (currentRow[x + 1]) neighbours.push(currentRow[x + 1]);
    if (prevRow) {
      if (prevRow[x - 1]) neighbours.push(prevRow[x - 1]);
      if (prevRow[x]) neighbours.push(prevRow[x]);
      if (prevRow[x + 1]) neighbours.push(prevRow[x + 1]);
    }
    if (nextRow) {
      if (nextRow[x - 1]) neighbours.push(nextRow[x - 1]);
      if (nextRow[x]) neighbours.push(nextRow[x]);
      if (nextRow[x + 1]) neighbours.push(nextRow[x + 1]);
    }

    return neighbours;
  }, []);

  const revealEmptyNeighbours = useCallback(
    (grid, y, x) => {
      const neighbours = [...getNeighbours(grid, y, x)];
      grid[y][x].isFlagged = false;
      grid[y][x].isRevealed = true;

      while (neighbours.length) {
        const neighbourGridCell = neighbours.shift();

        if (neighbourGridCell.isRevealed) {
          continue;
        }
        if (neighbourGridCell.isEmpty) {
          neighbours.push(
            ...getNeighbours(grid, neighbourGridCell.y, neighbourGridCell.x)
          );
        }

        neighbourGridCell.isFlagged = false;
        neighbourGridCell.isRevealed = true;
      }
    },
    [getNeighbours]
  );

  const checkVictory = useCallback(() => {
    const flaggedMines = grid.reduce((count, row) => {
      return count + row.filter(cell => cell.isMine && cell.isFlagged).length;
    }, 0);

    const flagged_incorrect = grid.reduce((count, row) => {
      return count + row.filter(cell => !cell.isMine && cell.isFlagged).length;
    }, 0);

    //se forem selecionadas o mesmo numero de minas do jogo e nao forem todas minas, perde
    if (flagged_incorrect + flaggedMines === mines && flagged_incorrect!== 0) {
      killBoard("lost");
      setGameOver(true); // Indica que o jogo terminou
      fimjogo("Perdeu");
    }
  
    if (flaggedMines === mines) {
      killBoard("win");
      setGameOver(true); // Indica que o jogo terminou
      fimjogo("Venceu");
    }
  }, [grid, mines, fimjogo]);

  const killBoard = (type) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map(row =>
        row.map(cell => ({
          ...cell,
          isRevealed: true
        }))
      );
      return newGrid;
    });
  };

  const handleLeftClick = (y, x) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    const newGrid = [...grid];
    const gridCell = newGrid[y][x];
    gridCell.isClicked = true;

    if (gridCell.isRevealed || gridCell.isFlagged) {
      return;
    }

    if (gridCell.isMine) {
      killBoard("lost");
      setGameOver(true); // Indica que o jogo terminou
      fimjogo("Perdeu");
      return;
    }

    if (gridCell.isEmpty) {
      revealEmptyNeighbours(newGrid, y, x);
    }

    gridCell.isFlagged = false;
    gridCell.isRevealed = true;
    setGrid(newGrid);
    checkVictory();
  };
  
  const handleRightClick = (e, y, x) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    e.preventDefault();
    const newGrid = [...grid];
    let newMinesCount = minesCount;
  
    if (newGrid[y][x].isRevealed) return;
  
    if (newGrid[y][x].isFlagged) {
      newGrid[y][x].isFlagged = false;
      newGrid[y][x].isUnknown = true;
      newMinesCount++; // Incrementar a contagem de minas ao desfazer a sinalização
    } else if (newGrid[y][x].isUnknown) {
      newGrid[y][x].isUnknown = false;
    } else {
      newGrid[y][x].isFlagged = true;
      newMinesCount--; // Decrementar a contagem de minas ao sinalizar uma célula como mina
    }
  
    setGrid(newGrid);
    setMinesCount(newMinesCount);
    checkVictory(); // Verificar vitória após cada clique
  };

  const createNewBoard = useCallback(
    (click = null) => {
      const newGrid = [];
      const minesArray = getRandomMines(mines, height, width, click);

      const addGridCell = (grid, gridCell) => {
        const y = grid.length - 1;
        const x = grid[y].length;
        const lastGridCell = gridCell;
        const neighbours = getNeighbours(grid, y, x);

        for (let neighbourGridCell of neighbours) {
          if (lastGridCell.isMine) {
            neighbourGridCell.n += 1;
          } else if (neighbourGridCell.isMine) {
            lastGridCell.n += 1;
          }
        }

        grid[y].push(gridCell);
      };

      for (let i = 0; i < height; ++i) {
        newGrid.push([]);
        for (let j = 0; j < width; ++j) {
          const gridCell = createGridCell(i, j, minesArray.includes(i * width + j));
          addGridCell(newGrid, gridCell);
        }
      }
      return newGrid;
    },
    [height, width, mines, getNeighbours]
  );

  const getRandomMines = (amount, columns, rows, starter = null) => {
    const minesArray = [];
    const limit = columns * rows;
    const minesPool = [...Array(limit).keys()];

    if (starter > 0 && starter < limit) {
      minesPool.splice(starter, 1);
    }

    for (let i = 0; i < amount; ++i) {
      const n = Math.floor(Math.random() * minesPool.length);
      minesArray.push(...minesPool.splice(n, 1));
    }

    return minesArray;
  };

  useEffect(() => {
    setGrid(createNewBoard());
    setMinesCount(mines);
  }, [height, width, mines, createNewBoard]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver]);
  

  //verifica as minas que já foram encontradas e envia para o jogo
  useEffect(() => {
    encontra_minas(minesCount);
  }, [minesCount, encontra_minas]);
  
  useEffect(() => {
    tempo_decorrido(elapsedTime);
  }, [elapsedTime, tempo_decorrido]);
  return (
    <div className="board">
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((gridCell) => (
              <Celula
                key={gridCell.y * row.length + gridCell.x}
                onClick={() => handleLeftClick(gridCell.y, gridCell.x)}
                cMenu={(e) => handleRightClick(e, gridCell.y, gridCell.x)}
                value={gridCell}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

Tabuleiro.propTypes = {
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  mines: PropTypes.number.isRequired,
};

export default Tabuleiro;
