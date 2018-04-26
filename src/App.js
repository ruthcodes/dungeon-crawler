import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      valBoard: [],
      width: 60,
      height: 20,
      maxRooms: 15,
      rooms: [],

      maxNoTunnels: 100,
      maxTunnelLen: 7,
      currentTunnelLength: 5,
      activeCell: '',
      features: 45,
      lastRoom: true,

    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.mapGenerator = this.mapGenerator.bind(this);
    this.neighbours = this.neighbours.bind(this);
    this.validMove = this.validMove.bind(this);
    this.randomRoomMaker = this.randomRoomMaker.bind(this);

    //new map feature functions
    this.randomNumber = this.randomNumber.bind(this);
    this.numberOfNeighbours = this.numberOfNeighbours.bind(this);
    this.makeRoom = this.makeRoom.bind(this);
    this.makeCorridor = this.makeCorridor.bind(this);
    this.findEdge = this.findEdge.bind(this);
    this.placeFeature = this.placeFeature.bind(this);
    this.generateMap = this.generateMap.bind(this);


    //attempt 3
    this.generateMapArray = this.generateMapArray.bind(this);
    this.addRooms = this.addRooms.bind(this);
    this.addCorridors = this.addCorridors.bind(this);

  }
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    this.generateMapArray();

  }

  componentDidUpdate(){

  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e){


    if(e.keyCode === 37 || e.keyCode === 65){
      this.addRooms();
      console.log("pressed left")
    }
    if (e.keyCode === 39 || e.keyCode === 68){
      this.addCorridors();
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
  }

  addRooms(){
    let counter = 0;
    let maxAttempts = 40;

      while(counter < this.state.maxRooms && maxAttempts > 0){
        console.log("counter: " + counter + " max: " + this.state.maxRooms)
        //validLocation is true
        var validLocation = true;
        //randomly generate height,width, and locations
        var height = this.randomNumber(5,8);
        console.log("height: " + height);
        var width = this.randomNumber(5,8);
        console.log("width: " + width);
        var locationRow = this.randomNumber(2,18);
        console.log("row: " + locationRow)
        var locationCol = this.randomNumber(2,58);
        console.log("col: " + locationCol)
        //check if height and width + locations is within the bounds of the board
        //if it's not continue (go back to the top and make new room)
        if ((width + locationCol > 59) || (height + locationRow > 19)){
          console.log("trying again, wont fit on board");
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
              console.log("there's already a room, not putting it here")
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
  }

  addCorridors(){
    let rooms = this.state.rooms.slice();
    //sort all the rooms from leftmost to rightmost
    rooms.sort((a,b)=>(a.locationCol - b.locationCol || a.locationRow - b.locationRow));
    this.setState({
      rooms: rooms
    })
    console.log(rooms)
    //loop through rooms
    let board = this.state.valBoard.slice();
    rooms.forEach((room, i) =>{

      if(i<rooms.length -1){

        //if next room has higher column (col+width) then it must be to the right
        if(room.locationCol + room.width < rooms[i+1].locationCol){
          //choose a random column
          let from1col = room.locationCol + room.width -1;
          let from1row = this.randomNumber(room.locationRow, (room.locationRow + room.height))

          let to2col = rooms[i+1].locationCol
          let to2row = this.randomNumber(rooms[i+1].locationRow, (rooms[i+1].locationRow + rooms[i+1].height))

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
          //if room is above or below
        } else {

        }
      }

    })
    this.setState({
      valBoard: board,
    })
  }
    //starts top left



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

  randomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  numberOfNeighbours(row,col){
    let x = [];
    //bottom right
    if(row === 39 && col === 39){
      x = [this.state.valBoard[38][39], this.state.valBoard[39][38]];
      //bottom left
    } else if (row === 39 && col === 0){
      x = [this.state.valBoard[38][0], this.state.valBoard[39][1]];
    //top right corner
    } else if (row === 0 && col === 39){
      x = [this.state.valBoard[0][38], this.state.valBoard[1][39]];
    //top left corner
    } else if (row === 0 && col === 0){
      x = [this.state.valBoard[0][1], this.state.valBoard[1][0]];
    //rightmost
    } else if (col === 39){
      x = [this.state.valBoard[row-1][39], this.state.valBoard[row+1][39]], this.state.valBoard[row][38];
    //leftmost
    } else if (col === 0){
      x = [this.state.valBoard[row-1][0], this.state.valBoard[row+1][0]], this.state.valBoard[row][1];
    //bottom
    } else if (row === 39){
      x = [this.state.valBoard[39][col-1], this.state.valBoard[39][col+1]], this.state.valBoard[row-1][col];
    //top
    } else if (row === 0){
      x = [this.state.valBoard[row][col-1], this.state.valBoard[row][col+1]], this.state.valBoard[row+1][col];
    // any non-edge
    } else {
      x = [this.state.valBoard[row-1][col], this.state.valBoard[row][col-1], this.state.valBoard[row][col+1], this.state.valBoard[row+1][col]];
    }

    let neighNum = x.filter(Boolean);
    return neighNum.length;
  }

  makeRoom(row,col,size){
    let board = this.state.valBoard.slice();

    for(let i=0;i<size;i++){
      for(let x=0;x<size;x++){
        board[row+i][col+x] = true;
      }
    }

    this.setState({
      valBoard:board,
    })
  }

  makeCorridor(row,col,length,direction){
    let board = this.state.valBoard.slice();

    for(let i=0; i<length; i++){
      if(direction === "horizontal"){
        board[row][col+i] = true;
      } else {
        board[row+i][col] = true;
      }
    }
    this.setState({
      valBoard:board,
    })
  }

  findEdge(){
    let edges = [];
    this.state.valBoard.map((row,i) => {
      if(row.includes(true)) row.map((col,x) =>{
        if (this.numberOfNeighbours(i,x) > 0 && this.numberOfNeighbours(i,x) < 4 && this.state.valBoard[i][x] === true) edges.push([i,x])
      })
    })
    console.log(edges);
    let randomIndex = this.randomNumber(0, edges.length - 1);
    return edges[randomIndex];
  }

  placeFeature(row,col){
    //this.randomNumber(0,1) === 0 ? this.makeRoom(row,col,5) : this.makeCorridor(row,col,5,"horizontal");
    if(this.state.lastRoom === true){
      this.randomNumber(0,1) === 0 ? this.makeCorridor(row,col,5,"vertical") : this.makeCorridor(row,col,5,"horizontal");

    } else {
      this.makeRoom(row,col,5)
    }
    this.setState({
      lastRoom: !this.state.lastRoom
    })
  }

  generateMap(){
    this.makeRoom(10,10,6);

    while(this.state.features > 0){
      let newFeatureLocation = this.findEdge();
      this.placeFeature(newFeatureLocation[0], newFeatureLocation[1])
      this.setState({
        features: this.state.features -1
      })
    }


  }

  randomRoomMaker(){
    //define a random room size (so 10 is 10x10 room)
    let room_size = Math.floor(Math.random() * (5 - 3 + 1)) + 3;

    //choose random spot on the board
    let board = this.state.valBoard.slice();
    let row = Math.floor(Math.random() * (40 - 1 + 1)) + 1;
    let col = Math.floor(Math.random() * (40 - 1 + 1)) + 1;
    board[row][col] = true; //this is my random start point to draw room


    //loop across and down 10, making cells true
    for (let i=0; i<room_size; i++){
      for (let x=0; x<room_size; x++){
        board[row+i][col+x] = true;
      }
    }
    //update the state with new room
    this.setState({
      valBoard: board,
    })
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
