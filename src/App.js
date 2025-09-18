import React, { useState } from 'react';
import "./assets/styles/App.css";
import { Header, Footer, Jogo} from "./components";

function App() {

  const [level, setLevel] = useState('basic');

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
  };

  return (
    <div id="container" className={`container-${level}`}>
      <Header />
      <Jogo onLevelChange={handleLevelChange} />
      <Footer />
    </div>
  );
}

export default App;
// Esta linha também poderia ser eliminada
// e adefinição da funsão ser substituida
// export default function App() {
