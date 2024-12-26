
import './App.css'
import Popup from './components/Popup'
import Board from './components/Board'
import { useState, useRef, useEffect } from 'react';
function App() {
  const [color, setColor] = useState("white")
  const [difficulty, setDifficulty] = useState("") //important to note, i originally had this set to "easy" however if user set to "easy" it would not trigger useeffect[difficulty] due to same value
  
  
  return (
    <>
            <div className='main-container'>
              <h1>Astarion</h1>
              <Popup setColor={setColor} setDifficulty={setDifficulty}></Popup>
              <Board color={color} difficulty={difficulty}></Board>
              <a href="https://github.com/Cameron-James-Mah/Astarion_Web" target="_blank">Visit my repo</a>
            </div>

        </>
  );
}

export default App;
