import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      width: 40,
      height: 40,
      maxNoTunnels: 100,
      maxTunnelLen: 7,
      currentTunnelLength: 5,
      valBoard: [],
      activeCell: ''
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.mapGenerator = this.mapGenerator.bind(this);
    this.neighbours = this.neighbours.bind(this);
    this.validMove = this.validMove.bind(this);
  }
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    var gridVal = [];
    var rowVal = [];
    for (let i=0; i<this.state.height; i++){
      for (let x=0; x<this.state.width; x++){
        rowVal.push(false)
      }
      gridVal.push(rowVal);
      rowVal = [];
    }
    this.setState({
      valBoard: gridVal,
    })
    console.log("mounted")

  }

  componentDidUpdate(){

  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e){
    this.mapGenerator();
    if(e.keyCode === 37 || e.keyCode === 65){
      console.log("pressed left")
    }
    if (e.keyCode === 39 || e.keyCode === 68){
      console.log("pressed right")
    }
    if (e.keyCode ===38 || e.keyCode === 87){
      console.log("pressed up")
    }
    if (e.keyCode === 40 || e.keyCode === 83){
      console.log("pressed down")
    }

  }

  validMove(row,col,direction){
    console.log("direction: " + direction)
    switch(direction){
      case 4:
        if(col > 0){

          return true;
        } else {
          return false;
        }
        break;
      case 3:
        if(col < 39){

          return true;
        } else {
          return false;
        }
        break;
      case 2:
        if(row < 39){

          return true;
        } else {
          return false;
        }
        break;
      case 1:
        if(row > 0){

          return true;
        } else {
          return false;
        }
          break;
    }
  }

  mapGenerator(){
    console.log("generating map");
    //choose a random tile on the board as starting point
    let board = this.state.valBoard.slice();
    let row = Math.floor(Math.random() * (40 - 1 + 1)) + 1;
    let col = Math.floor(Math.random() * (40 - 1 + 1)) + 1;
    board[row][col] = true;

    this.setState({
      valBoard: board,
      activeCell: [row,col],

    });

    while (this.state.maxNoTunnels > 0){
      let tunnelLength = Math.floor(Math.random() * (this.state.maxTunnelLen - 0 + 1)) + 0;
      this.setState({
        currentTunnelLength: tunnelLength
      })
      //console.log("running")
      //console.log("tunnelLength: " + this.state.currentTunnelLength);
      let direction = Math.floor(Math.random() * (4 - 1 + 1)) + 1;

      for(let i=0; i<this.state.currentTunnelLength; i++){
        let board = this.state.valBoard.slice();
        let copy = this.state.activeCell.slice();
        let row = copy[0];
        let col = copy[1];
        console.log("row: " + row)
        console.log("col: " + col)
        if(this.validMove(row,col,direction)){
          if(direction === 4){
            copy[1] -= 1;
          } else if (direction === 3){
            copy[1] += 1;
          } else if (direction === 2){
            copy[0] += 1;
          } else {
            copy[0] -= 1;
          }
          board[copy[0]][copy[1]] = true;
          this.setState({
            valBoard: board,
            activeCell: copy,
            currentTunnelLength: this.state.currentTunnelLength - 1,
          })
        } else {
          //if it's not a valid move, set activeCell to current cell and break so loop continues
          this.setState({
            activeCell: copy,
          })
          break;
        }
      }

      this.setState({
        maxNoTunnels: this.state.maxNoTunnels -1,
      })
    }
  }

  //maybe unecessary? Will use .includes() to check for neighbours
    neighbours(n,j){
      let b = this.state.valBoard;
      let neighbours = [b[n-1][j], b[n][j-1], b[n][j+1], b[n+1][j]];
      return neighbours;
    }


  render() {
    return (
      <div className="App">
          <Grid board={this.state.valBoard} handleClick={this.handleClick} />
      </div>
    )
  }
}

function Cell(props) {
    return (
      <div className="cell" data-value={props['data-value']} data-row={props['data-row']} data-key={props['data-key']}></div>
    )
}


  function Grid(props){
    return(
        <div className="gridContainer">
          {props.board.map((nested, x) => nested.map((element, i) => <Cell key={i+x} data-row={x} data-col={i} data-value={element}/>))}
        </div>
    )
  }

export default App;
