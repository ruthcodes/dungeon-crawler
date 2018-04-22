import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      width: 40,
      height: 40,
      maxNoTunnels: 4,
      maxTunnelLen: 5,
      currentTunnelLength: 5,
      valBoard: [],
      activeCell: ''
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.mapGenerator = this.mapGenerator.bind(this);
    this.neighbours = this.neighbours.bind(this);
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

  mapGenerator(){
    //choose a random tile on the board as starting point
    let board = this.state.valBoard.slice();
    let row = Math.floor(Math.random() * (39 - 0 + 1)) + 0;
    let col = Math.floor(Math.random() * (39 - 0 + 1)) + 0;
    board[row][col] = true;
    let tunnelLength = Math.floor(Math.random() * (this.state.maxTunnelLen - 0 + 1)) + 0;
    this.setState({
      valBoard: board,
      activeCell: [row,col],
      currentTunnelLength: tunnelLength
    });
    console.log("active coord: "+ this.state.activeCell )
    console.log("active row: " + this.state.activeCell[0])

    while (this.state.maxNoTunnels > 0){

      console.log("tunnelLength: " + this.state.currentTunnelLength);
      let direction = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
      switch(direction) {
        case 4:
          //go left
          while(this.state.activeCell[1] >= 0 && this.state.currentTunnelLength > 0){
            let board = this.state.valBoard.slice();
            let copy = this.state.activeCell.slice();
            copy[1] -= 1;
            board[copy[0]][copy[1]] = true;
            tunnelLength -=1;
            this.setState({
              valBoard: board,
              activeCell: copy,
              currentTunnelLength: this.state.currentTunnelLength - 1,
            })
          }
          break;
        case 3:
          //go right
          while(this.state.activeCell[1] <= 39 && this.state.currentTunnelLength > 0){
            let board = this.state.valBoard.slice();
            let copy = this.state.activeCell.slice();
            copy[1] += 1;
            board[copy[0]][copy[1]] = true;
            tunnelLength -=1;
            this.setState({
              valBoard: board,
              activeCell: copy,
              currentTunnelLength: this.state.currentTunnelLength - 1,
            })
          }
          break;
        case 2:
          //go down
          while(this.state.activeCell[0] <= 39 && this.state.currentTunnelLength > 0){
            let board = this.state.valBoard.slice();
            let copy = this.state.activeCell.slice();
            copy[0] += 1;
            board[copy[0]][copy[1]] = true;
            tunnelLength -=1;
            this.setState({
              valBoard: board,
              activeCell: copy,
              currentTunnelLength: this.state.currentTunnelLength - 1,
            })
          }
          break;
        default:
          //go up
          while(this.state.activeCell[0] >= 0 && this.state.currentTunnelLength > 0){
            let board = this.state.valBoard.slice();
            let copy = this.state.activeCell.slice();
            copy[0] -= 1;
            board[copy[0]][copy[1]] = true;
            tunnelLength -=1;
            this.setState({
              valBoard: board,
              activeCell: copy,
              currentTunnelLength: this.state.currentTunnelLength - 1,
            })
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
