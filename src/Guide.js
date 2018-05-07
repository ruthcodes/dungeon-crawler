import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSquare from '@fortawesome/fontawesome-free-solid/faSquare';

export function Guide(props){
  return (
    <div className="guideContainer">
      <div className="guideText">
        <p id="player"><FontAwesomeIcon icon={faSquare} /> <span className="guideLabels">Player</span></p>
        <p id="health"><FontAwesomeIcon icon={faSquare} /> <span className="guideLabels">Health</span></p>
        <p id="enemy"><FontAwesomeIcon icon={faSquare} />  <span className="guideLabels">Enemy</span></p>
        <p id="weapon"><FontAwesomeIcon icon={faSquare} /> <span className="guideLabels">Weapon</span></p>
        <p id="stairs"><FontAwesomeIcon icon={faSquare} /> <span className="guideLabels">Stairs</span></p>
      </div>
    </div>
  )
}
