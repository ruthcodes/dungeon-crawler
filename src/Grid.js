import React from 'react';
import { Cell } from './Cell';

export function Grid(props){
  return(
      <div className="gridContainer">
        {props.board.map((nested, x) => nested.slice(props.playerCol-10,props.playerCol+10).map((element, i) =>
          <Cell key={i+x} data-row={x} wallColour={props.wallColour} data-col={props.playerCol-10+i} data-value={element} data-isvis={(props.dark) ? props.checkRendering(x,props.playerCol-10+i) : "Visible"}/>))}
      </div>
  )
}
