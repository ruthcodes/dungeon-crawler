import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      valBoard: [],
      width: 60,
      height: 20,
      maxRooms: 20,
      rooms: [],
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.randomNumber = this.randomNumber.bind(this);
    //map generation functions
    this.generateMapArray = this.generateMapArray.bind(this);
    this.addRooms = this.addRooms.bind(this);
    this.addCorridors = this.addCorridors.bind(this);

  }
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    this.generateMapArray().then(()=>this.addRooms()).then(()=>this.addCorridors()).then(()=>this.addCorridors())
  }

  componentDidUpdate(){

  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e){


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

//functions for new map attempt 3
  generateMapArray(){
    var board = [];
    var rows = [];
    for (let i=0; i<this.state.height; i++){
      for (let x=0; x<this.state.width; x++){
        rows.push(false)
      }
      board.push(rows);
      rows = [];
    }
    this.setState({
      valBoard: board,
    })
    return Promise.resolve('success');
  }

  addRooms(){
    let counter = 0;
    let maxAttempts = 50;

      while(counter < this.state.maxRooms && maxAttempts > 0){
        //validLocation is true
        var validLocation = true;
        //randomly generate height,width, and locations
        var height = this.randomNumber(5,8);
        var width = this.randomNumber(5,8);
        var locationRow = this.randomNumber(2,18);
        var locationCol = this.randomNumber(2,58);
        //check if height and width + locations is within the bounds of the board
        //if it's not continue (go back to the top and make new room)
        if ((width + locationCol > 59) || (height + locationRow > 19)){
          maxAttempts--;
          continue;
        }
        //col&width x
        //nested loop, first through location row and then through location col (up to location + size)
        //plus one ensures 1 between each room
        //check that there isn't already a room there (true values)
        //if there is, set validLocation to false, break

        loop1:
        for (let i=locationRow -1; i< locationRow + height+1; i++){
          for (let x=locationCol-1; x< locationCol + width+1; x++){
            if (this.state.valBoard[i][x] === true){
              validLocation = false;
              maxAttempts--;
              break loop1;
            }
          }
        }

        let board = this.state.valBoard.slice();
        //finally, if placeable, nested loop to place room
        if(validLocation){
          for (let i=locationRow; i< locationRow + height; i++){
            for (let x=locationCol; x< locationCol + width; x++){
              board[i][x] = true
            }
          }
          counter++;

        let rooms = this.state.rooms.slice();
        rooms.push({
          index: counter,
          height: height,
          width: width,
          locationRow: locationRow,
          locationCol: locationCol
        })

        this.setState({
          valBoard: board,
          rooms: rooms,
        })
      }

      }
      return Promise.resolve('success');
  }

  addCorridors(){
    let rooms = this.state.rooms.slice();
    //sort all the rooms from leftmost to rightmost
    rooms.sort((a,b)=>(a.locationCol - b.locationCol || a.locationRow - b.locationRow));
    this.setState({
      rooms: rooms
    })
    //loop through rooms
    let board = this.state.valBoard.slice();
    rooms.forEach((room, i) =>{

      if(i<rooms.length -1){
        let from1col;
        let from1row;
        let to2col;
        let to2row;

        //if next room has higher column (col+width) then it must be to the right
        if(room.locationCol + room.width < rooms[i+1].locationCol){
          from1col = room.locationCol + room.width -1;
          from1row = this.randomNumber(room.locationRow, (room.locationRow + room.height))
          to2col = rooms[i+1].locationCol
          to2row = this.randomNumber(rooms[i+1].locationRow, (rooms[i+1].locationRow + rooms[i+1].height)-1)
          //if room is up
        } else if (room.locationRow > rooms[i+1].locationRow + rooms[i+1].height){
          from1col = this.randomNumber(room.locationCol, (room.locationCol + room.width))
          from1row = room.locationRow;
          to2col = this.randomNumber(rooms[i+1].locationCol, (rooms[i+1].locationCol + rooms[i+1].width)-1)
          to2row = rooms[i+1].locationRow + rooms[i+1].height -1;
          //room is down
        } else {
          from1col = this.randomNumber(room.locationCol, (room.locationCol + room.width) -1)
          from1row = room.locationRow + room.height -1;
          to2col = this.randomNumber(rooms[i+1].locationCol, (rooms[i+1].locationCol + rooms[i+1].width)-1)
          to2row = rooms[i+1].locationRow;
        }
          if(from1row === to2row){
            for(let x= from1col; x< to2col; x++){
              board[from1row][x] = true;
            }
          } else {
            let turn = this.randomNumber(from1col,to2col);

            for(let i=from1col;i<turn;i++){
              board[from1row][i] = true;
            }
            if (from1row < to2row){
              for(let i=from1row; i<to2row;i++){
                board[i][turn] = true;
              }
            } else {
              for(let i=from1row;i>to2row;i--){
                board[i][turn] = true;
              }
            }
            for (let i=turn;i<to2col;i++){
              board[to2row][i] = true;
            }

          }
      }
    })
    this.setState({
      valBoard: board,
    })
    return Promise.resolve('success');
  }
    //starts top left

  randomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
