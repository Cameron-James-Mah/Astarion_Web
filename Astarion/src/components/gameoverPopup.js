import React from 'react';
import './Popup.css'; // Use the same CSS file as the existing Popup

function GameOverPopup({ result}) {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>Game Over</h2>
        <p>
          {result === "win" ? "You won :)" : result === "lose" ? "You lost :(" : "It's a draw"}
        </p>
        <div className="color-options">
          <button onClick={() => window.location.reload(false)}>Restart</button>
        </div>
      </div>
    </div>
  );
}

export default GameOverPopup;