import React from 'react';

export function AddButton(props){
  return (
    <button className={"btn btn-dark"} onClick={props.onClick}>Toggle Darkness</button>
  )
}
