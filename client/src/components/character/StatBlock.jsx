import './StatBlock.css';

const StatBlock = ({ stats }) => {
  const calculateModifier = (score) => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const statNames = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA'
  };

  return (
    <div className="stat-block">
      <h3>Ability Scores</h3>
      <div className="stats-grid-display">
        {Object.entries(stats).map(([statName, value]) => (
          <div key={statName} className="stat-item">
            <div className="stat-label">{statNames[statName]}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-modifier">{calculateModifier(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatBlock;
