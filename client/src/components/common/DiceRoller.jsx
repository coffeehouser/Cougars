import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DiceRoller.css';

const DiceRoller = () => {
  const { user } = useAuth();
  const [selectedDie, setSelectedDie] = useState('d20');
  const [rolling, setRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState(null);
  const [rollHistory, setRollHistory] = useState([]);

  const diceTypes = [
    { value: 'd4', sides: 4, label: 'D4' },
    { value: 'd6', sides: 6, label: 'D6' },
    { value: 'd8', sides: 8, label: 'D8' },
    { value: 'd10', sides: 10, label: 'D10' },
    { value: 'd12', sides: 12, label: 'D12' },
    { value: 'd20', sides: 20, label: 'D20' },
    { value: 'd100', sides: 100, label: 'D100' }
  ];

  // Load roll history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('diceRollHistory');
    if (savedHistory) {
      setRollHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save roll history to localStorage whenever it changes
  useEffect(() => {
    if (rollHistory.length > 0) {
      localStorage.setItem('diceRollHistory', JSON.stringify(rollHistory));
    }
  }, [rollHistory]);

  const rollDice = () => {
    const die = diceTypes.find(d => d.value === selectedDie);
    if (!die) return;

    setRolling(true);

    // Animate the roll
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const tempRoll = Math.floor(Math.random() * die.sides) + 1;
      setCurrentRoll(tempRoll);
      rollCount++;

      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * die.sides) + 1;
        setCurrentRoll(finalRoll);
        setRolling(false);

        // Add to history (max 20 rolls, remove oldest first)
        const newRoll = {
          id: Date.now(),
          die: die.label,
          result: finalRoll,
          character: user?.username || 'Guest',
          timestamp: new Date().toLocaleTimeString()
        };

        setRollHistory(prevHistory => {
          const updatedHistory = [newRoll, ...prevHistory];
          return updatedHistory.slice(0, 20); // Keep only latest 20
        });
      }
    }, 100);
  };

  const clearHistory = () => {
    setRollHistory([]);
    localStorage.removeItem('diceRollHistory');
  };

  return (
    <div className="dice-roller-container">
      <div className="dice-roller-card">
        <h2>🎲 Dice Roller</h2>

        <div className="dice-selection">
          {diceTypes.map(die => (
            <button
              key={die.value}
              className={`die-button ${selectedDie === die.value ? 'active' : ''}`}
              onClick={() => setSelectedDie(die.value)}
              disabled={rolling}
            >
              {die.label}
            </button>
          ))}
        </div>

        <div className={`dice-display ${rolling ? 'rolling' : ''}`}>
          {currentRoll !== null ? (
            <div className="dice-result">
              <span className="result-number">{currentRoll}</span>
              <span className="result-label">{diceTypes.find(d => d.value === selectedDie)?.label}</span>
            </div>
          ) : (
            <div className="dice-placeholder">
              <span>🎲</span>
              <p>Select a die and roll!</p>
            </div>
          )}
        </div>

        <button
          className="roll-button"
          onClick={rollDice}
          disabled={rolling}
        >
          {rolling ? 'Rolling...' : 'Roll Dice'}
        </button>
      </div>

      {rollHistory.length > 0 && (
        <div className="roll-history-card">
          <div className="history-header">
            <h3>📜 Roll History</h3>
            <button className="clear-history-btn" onClick={clearHistory}>
              Clear
            </button>
          </div>

          <div className="roll-history-list">
            {rollHistory.map(roll => (
              <div key={roll.id} className="history-item">
                <div className="history-die">{roll.die}</div>
                <div className="history-result">{roll.result}</div>
                <div className="history-info">
                  <span className="history-character">{roll.character}</span>
                  <span className="history-time">{roll.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
