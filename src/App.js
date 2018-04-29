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
      playerRow: 0,
      playerCol: 0,

      player: {
        health: 50,
        level: 1,
        weapon: {
          name: "fist",
          damage: 5
        },
        died: false,
      },

      weapons: [
        {name:"fists",damage:5},
        {name:"brass knuckles",damage:10},
        {name:"dagger",damage:15},
        {name:"sword", damage:20},
        {name:"laser", damage:25},
        {name:"lightsaber",damage:30},
        {name:"sharknado", damage:35},
        {name: "kindness",damage:40}
      ],

      enemies: [],
      dungeonFloor: 1,
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.randomNumber = this.randomNumber.bind(this);
    //map generation functions
    this.generateMapArray = this.generateMapArray.bind(this);
    this.addRooms = this.addRooms.bind(this);
    this.addCorridors = this.addCorridors.bind(this);

    this.placePlayer = this.placePlayer.bind(this);
    this.validMove = this.validMove.bind(this);

    this.placeGameObjects = this.placeGameObjects.bind(this);
    this.setGameEnvironment = this.setGameEnvironment.bind(this);
    this.fightEnemy = this.fightEnemy.bind(this);


  }
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    this.setGameEnvironment();
  }

  componentDidUpdate(){

  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  setGameEnvironment(){
    this.generateMapArray()
      .then(()=>this.addRooms())
      .then(()=>this.addCorridors())
      .then(()=>this.addCorridors())
      .then(()=>this.placePlayer())
      .then(()=>this.placeGameObjects("enemy",3))
      .then(()=>this.placeGameObjects("health",3))
      .then(()=>this.placeGameObjects("stairs",1))
      .then(()=>this.placeGameObjects("weapon",1))
  }

  handleKeyDown(e){
    e.preventDefault();
    let board = this.state.valBoard.slice();
    board[this.state.playerRow][this.state.playerCol] = true;
    let row;
    let col;

    if(e.keyCode === 37 || e.keyCode === 65){
      col = this.state.playerCol-1;
      row = this.state.playerRow;
      //left
    }

    if (e.keyCode === 39 || e.keyCode === 68){
      col = this.state.playerCol+1;
      row = this.state.playerRow;
      //right
    }
    if (e.keyCode ===38 || e.keyCode === 87){
      col = this.state.playerCol;
      row = this.state.playerRow-1;
      //up
    }
    if (e.keyCode === 40 || e.keyCode === 83){
      //down
      col = this.state.playerCol;
      row = this.state.playerRow+1;
    }
    if(this.validMove(row, col)){
      if(board[row][col] === "stairs"){
        board[row][col] = true;
        this.setState({
          dungeonFloor: this.state.dungeonFloor + 1,
          rooms: [],
          enemies:[],
        })
        this.setGameEnvironment();
      } else if(board[row][col] === "health"){
        board[row][col] = "player";
        let player = Object.assign({}, this.state.player);
        player.health = player.health + (10 * this.state.dungeonFloor);
        this.setState({
          player: player,
          valBoard:board,
          playerRow: row,
          playerCol: col,
        })
      } else if(board[row][col] === "weapon"){
        board[row][col] = "player";
        let player = Object.assign({}, this.state.player);
        player.weapon = this.state.weapons[this.state.dungeonFloor];
        this.setState({
          player: player,
          valBoard:board,
          playerRow: row,
          playerCol: col,
        })
      } else if (board[row][col] === "enemy"){
        board[this.state.playerRow][this.state.playerCol] = "player";
        let result = this.fightEnemy(row,col);
        if(result === "killed"){
          board[this.state.playerRow][this.state.playerCol] = true;
          board[row][col] = "player";
          this.setState({
            valBoard:board,
            playerRow: row,
            playerCol: col,
          })
        } else if(result === "playerDied"){
          console.log("the player has died")
        }

      }else{
        board[row][col] = "player";
        this.setState({
          valBoard:board,
          playerRow: row,
          playerCol: col,
        })
      }

    }
  }

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
    let maxAttempts = 100;

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

  placePlayer(){
    let rooms = this.state.rooms.slice();
    let n = Math.round(rooms.length / 2);

    let playerRow = this.randomNumber(rooms[n].locationRow, (rooms[n].locationRow + rooms[n].height)-1);
    let playerCol = this.randomNumber(rooms[n].locationCol, (rooms[n].locationCol + rooms[n].width)-1);

    let board = this.state.valBoard.slice();
    board[playerRow][playerCol] = "player";

    this.setState({
      valBoard: board,
      playerRow: playerRow,
      playerCol: playerCol,
    })
    return Promise.resolve('Success');
  }

  placeGameObjects(object, numberOfObjects){
    let rooms = this.state.rooms.slice();
    let board = this.state.valBoard.slice();
    let enemies= this.state.enemies.slice();

    for(let i=0; i<numberOfObjects;i++){
      let n = this.randomNumber(0,rooms.length-1);
      let row = this.randomNumber(rooms[n].locationRow, (rooms[n].locationRow + rooms[n].height)-1);
      let col = this.randomNumber(rooms[n].locationCol, (rooms[n].locationCol + rooms[n].width)-1);
      board[row][col] = object;
      if(object === "enemy"){
        let newEnemy = {health: this.state.dungeonFloor*10, level: this.state.dungeonFloor, row:row, col:col}
        enemies.push(newEnemy);
      }
    }
    this.setState({
      valBoard: board,
      enemies: enemies,
    })

    return Promise.resolve('Success');
  }


  validMove(row,col){
    let board = this.state.valBoard.slice();
    if(row >= 0 && row < 20 && col >=0 && col <60 && board[row][col] !== false){
      return true;
    }
    return false;
  }

  fightEnemy(row,col){
    //find out which monster it is based on row/col
    let enemies = this.state.enemies.slice()
    let player = Object.assign({}, this.state.player);
    //this is an array with the correct enemy object in it
    let remainingEnemies = enemies.filter(enemy => (enemy.row !== row || enemy.col !== col));
    //console.log(remainingEnemies);
    let enemy = enemies.filter(enemy => (enemy.row === row && enemy.col === col));
    //calculate damage by player based on player.level and player.weapon.damage
    //minimum is player.weapon.damage/2 * level rounded, max is player.weapon.damage * level
    let playerAttack = Math.round(this.randomNumber(player.weapon.damage/2 * player.level, (player.weapon.damage * player.level)-1));

    enemy[0].health = enemy[0].health - playerAttack;
    if(enemy[0].health > 0){
      remainingEnemies.push(enemy[0]);
      let enemyAttack = Math.round(this.randomNumber(this.state.dungeonFloor * 5, this.state.dungeonFloor * 10));
      player.health = player.health - enemyAttack;
    }
    this.setState({
      enemies: remainingEnemies,
      player: player,
    })
    if(enemy[0].health <= 0){
      return "killed";
    }
    if(player.health <= 0){
      player.died = true;
      this.setState({
        player: player,
      })
    }

    //calculate enemy damage based off dungeonFloor(level) * 5-10
    //player attacks, minus that number from enemy.health
    //monster attacks, minus that number from player.health
  }

  randomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  render() {
    return (
      <div className="App">
          <div className="overlay" style={(this.state.player.died ? {opacity: 1}: {opacity:0})}><span className="diedText" style={(this.state.player.died ? {visibility:"visible"} : {visibility:"hidden"})}>"You died. Restart?"</span></div>
          <div className="game">
            <Grid board={this.state.valBoard} handleClick={this.handleClick} />
            <Stats player={this.state.player} dungeonFloor={this.state.dungeonFloor}/>
          </div>
      </div>
    )
  }
}

function Stats(props){
  return(
    <div className="statsContainer">
      <p>Health: {props.player.health}</p>
      <p>Level: {props.player.level}</p>
      <p>Weapon: {props.player.weapon.name}</p>
      <p>Dungeon Level: {props.dungeonFloor}</p>
    </div>
  )
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
