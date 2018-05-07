import React from 'react';

export function Stats(props){
  return(
    <div className="statsContainer">
      <div className="statsText">
        <p>Health: <span className="statsData">{props.player.health}</span></p>
        <p>Level: <span className="statsData">{props.player.level}</span></p>
        <p>XP to next level: <span className="statsData">{props.player.xpToLevel}</span></p>
        <p>Weapon: <span className="statsData">{props.player.weapon.name}</span></p>
        <p>Dungeon level: <span className="statsData">{props.dungeonFloor}</span></p>
      </div>
    </div>
  )
}
