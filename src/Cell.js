import React from 'react';

export function Cell(props) {
    return (
      <div className={"cell"} data-value={props['data-value']} data-row={props['data-row']} data-key={props['data-key']} data-col={props['data-col']} data-isvis={props['data-isvis']} dark={props.dark}></div>
    )
}
