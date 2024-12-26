import React, { useState, useEffect, useRef } from 'react';
import './Popup.css'; // Ensure you have some CSS for the popup styling
import wKing from './wKing.png';
import bKing from './bKing.png';

function Popup({setColor, setDifficulty}) {
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [selectedSide, setSelectedSide] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [boardOrientation, setBoardOrientation] = useState('white');

  useEffect(() => {
    // Automatically show the popup when the component mounts
    setIsPopupVisible(true);
  }, []);

  const handleSideSelect = (side) => {
    setSelectedSide(side);
    setBoardOrientation(side === 'White' ? 'white' : 'black');
    setColor(side.toLowerCase())
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    //setDifficulty(difficulty)
    
  };

  const handleStart = () => {
    if (selectedSide && selectedDifficulty) {
      setIsPopupVisible(false);
      //setColor(selectedSide.toLocaleLowerCase())
      setDifficulty(selectedDifficulty)
    } else {
      alert('Please select both a side and a difficulty before starting.');
    }
  };

  return (
    <div className="App">
      {isPopupVisible && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Select a Side:</h2>
            <div className="color-options">
              <button
                onClick={() => handleSideSelect('White')}
                className={selectedSide === 'White' ? 'selected' : ''}
              >
                <img src={wKing} alt="White King" className="icon" />
              </button>
              <button
                onClick={() => handleSideSelect('Black')}
                className={selectedSide === 'Black' ? 'selected' : ''}
              >
                <img src={bKing} alt="Black King" className="icon" />
              </button>
            </div>
            <h2>Choose Difficulty:</h2>
            <div className="color-options">
              <button
                onClick={() => handleDifficultySelect('easy')}
                className={selectedDifficulty === 'easy' ? 'selected' : ''}
              >
                Easy
              </button>
              <button
                onClick={() => handleDifficultySelect('medium')}
                className={selectedDifficulty === 'medium' ? 'selected' : ''}
              >
                Medium
              </button>
              <button
                onClick={() => handleDifficultySelect('hard')}
                className={selectedDifficulty === 'hard' ? 'selected' : ''}
              >
                Hard
              </button>
            </div>
            <div className="color-options">
              <button onClick={handleStart}>
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Popup;
