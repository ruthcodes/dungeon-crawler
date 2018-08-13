import React, { Component } from 'react';
import './App.css';
import humane from 'humane-js';
import 'humane-js/themes/original.css';
import './bootstrap.min.css';
import { Stats } from './Stats';
import { AddButton } from './AddButton';
import { Grid } from './Grid';
import { Guide } from './Guide';
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      windowWidth: 0,
      windowHeight: 0,

      valBoard: [],
      width: 80,
      height: 20,
      maxRooms: 20,
      rooms: [],
      playerRow: 0,
      playerCol: 0,
      dark: true,

      player: {
        health: 50,
        level: 1,
        xpToLevel: 60,
        weapon: {
          name: "Fists",
          damage: 5
        },
        died: false,
      },

      weapons: [
        {name:"Brass knuckles",damage:10},
        {name:"Dagger",damage:15},
        {name:"Sword", damage:20},
        {name:"Laser", damage:25},
        {name:"Lightsaber",damage:26},
        {name:"Sharknado", damage:28},
        {name:"Kindness",damage:30}
      ],

      weaponCounter: 0,

      enemies: [],
      boss: {health:100, row:0, row1:0, col:0, col1:0},
      dungeonFloor: 1,
    };

    document.addEventListener('DOMContentLoaded', this.onDOMLoaded);

    this.layoutName = "default";

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.toggleDarkness = this.toggleDarkness.bind(this);
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
    this.fightBoss = this.fightBoss.bind(this);

    this.checkRendering = this.checkRendering.bind(this);
    this.reset = this.reset.bind(this);

  }

  onDOMLoaded = () => {
    this.keyboard = new Keyboard({
      debug: true,
      layoutName: this.layoutName,
      onKeyPress: button => this.onKeyPress(button),
      newLineOnEnter: true,
      layout: {
        'default': [
          'w',
          'a s d',
        ]}
    });

  }
  updateWindowDimensions() {
    this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
  }


  onKeyPress = button => {
    let e = new Event('keydown');
    e.key=button

    console.log(e)
    this.handleKeyDown(e)
  }


  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    this.setGameEnvironment();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  setGameEnvironment(){
    this.generateMapArray()
      .then(()=>this.addRooms())
      .then(()=>this.addCorridors())
      .then(()=>this.addCorridors())
      .then(()=>this.placeGameObjects("enemy",3))
      .then(function(value){
        if(this.state.dungeonFloor < 5) {
        this.placeGameObjects("health",3)
      } else {
        this.placeGameObjects("health",4)
      }
    }.bind(this))
      .then(()=>this.placeGameObjects("weapon",1))
      .then(()=>this.placePlayer())
      .then(function(value){
        if(this.state.dungeonFloor === 7) {
        this.placeGameObjects("boss",1)
      } else {
        this.placeGameObjects("stairs",1)
      }
    }.bind(this))
    return Promise.resolve('Success');
  }

  handleKeyDown(e){
    e.preventDefault();
    let board = this.state.valBoard.slice();
    board[this.state.playerRow][this.state.playerCol] = "floor";
    let boss = Object.assign({}, this.state.boss);
    let row;
    let col;
    //left
    if(e.keyCode === 37 || e.keyCode === 65 || e.key === "a"){
      col = this.state.playerCol-1;
      row = this.state.playerRow;
    }
    //right
    if (e.keyCode === 39 || e.keyCode === 68 || e.key === "d"){
      col = this.state.playerCol+1;
      row = this.state.playerRow;
    }
    //up
    if (e.keyCode ===38 || e.keyCode === 87 || e.key === "w"){
      col = this.state.playerCol;
      row = this.state.playerRow-1;
    }
    //down
    if (e.keyCode === 40 || e.keyCode === 83 ||e.key === "s"){
      col = this.state.playerCol;
      row = this.state.playerRow+1;
    }
    if(this.validMove(row, col)){
      if(board[row][col] === "stairs"){
        board[row][col] = "floor";
        this.setState({
          dungeonFloor: this.state.dungeonFloor + 1,
          rooms: [],
          enemies:[],
        })
        this.setGameEnvironment();
      } else if(board[row][col] === "health"){
        board[row][col] = "player";
        let player = Object.assign({}, this.state.player);
        player.health = player.health + (this.randomNumber(8*this.state.dungeonFloor, 9*this.state.dungeonFloor));
        this.setState({
          player: player,
          valBoard:board,
          playerRow: row,
          playerCol: col,
        })
      } else if(board[row][col] === "weapon"){
        board[row][col] = "player";
        let player = Object.assign({}, this.state.player);
        player.weapon = this.state.weapons[this.state.weaponCounter];
        this.setState({
          player: player,
          valBoard:board,
          playerRow: row,
          playerCol: col,
          weaponCounter: this.state.weaponCounter + 1,
        })
      } else if (board[row][col] === "enemy"){
        board[this.state.playerRow][this.state.playerCol] = "player";
        let result = this.fightEnemy(row,col);
        if(result === "killed"){
          board[this.state.playerRow][this.state.playerCol] = "floor";
          board[row][col] = "player";
          this.setState({
            valBoard:board,
            playerRow: row,
            playerCol: col,
          })
        } else if(result === "playerDied"){
          humane.log("You died");
          this.reset();
        }

      } else if(board[row][col] === "boss"){
        board[this.state.playerRow][this.state.playerCol] = "player";
        let result = this.fightBoss();
        if(result === "killed"){
          board[boss.row][boss.col] = "floor";
          board[boss.row1][boss.col1] = "floor";
          board[boss.row][boss.col1] = "floor";
          board[boss.row1][boss.col] = "floor";
          board[this.state.playerRow][this.state.playerCol] = "floor";
          board[row][col] = "player";
          this.setState({
            valBoard:board,
            playerRow: row,
            playerCol: col,
            boss: boss,
          })
          humane.log("You won!");
          this.reset();
        } else if (result === "playerDied"){
          humane.log("You died");
          this.reset();
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
    else {
      board[this.state.playerRow][this.state.playerCol] = "player";
      this.setState({
        valBoard:board,
      })
    }

  }

  handleClick(){
    let player = Object.assign({}, this.state.player);
    player.health = 50;
    player.level = 1;
    player.weapon = {
      name: "fist",
      damage: 5
    };
    player.died = false;

    this.setState({
      player: player,
      playerRow: this.state.playerRow,
      playerCol: this.state.playerCol,
      rooms: [],
      enemies: [],
      dungeonFloor: 1,
      weaponCounter:0,
      boss: {health:100, row:0, row1:0, col:0, col1:0},
    })
    this.setGameEnvironment();
  }

  toggleDarkness(){
    console.log("toggling");
    this.setState({
      dark: !this.state.dark,
    })
  }

  generateMapArray(){
    var board = [];
    var rows = [];
    for (let i=0; i<this.state.height; i++){
      for (let x=0; x<this.state.width; x++){
        rows.push("wall")
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
        var validLocation = true;
        //randomly generate height,width, and locations
        var height = this.randomNumber(5,8);
        var width = this.randomNumber(5,8);
        var locationRow = this.randomNumber(2,18);
        var locationCol = this.randomNumber(10,68);
        //check if height and width + locations is within the bounds of the board
        //if it's not start again
        if ((width + locationCol > 69) ||  (height + locationRow > 19)){
          maxAttempts--;
          continue;
        }
        //+1 ensures gaps between rooms
        //break if room already exists at location
        loop1:
        for (let i=locationRow -1; i< locationRow + height+1; i++){
          for (let x=locationCol-1; x< locationCol + width+1; x++){
            if (this.state.valBoard[i][x] === "floor"){
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
              board[i][x] = "floor";
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
          //connect rooms straight along a row
          if(from1row === to2row){
            for(let x= from1col; x< to2col; x++){
              board[from1row][x] = "floor";
            }
          // otherwise, choose somewhere to turn
          } else {
            let turn = this.randomNumber(from1col,to2col);

            for(let i=from1col;i<turn;i++){
              board[from1row][i] = "floor";
            }
            if (from1row < to2row){
              for(let i=from1row; i<to2row;i++){
                board[i][turn] = "floor";
              }
            } else {
              for(let i=from1row;i>to2row;i--){
                board[i][turn] = "floor";
              }
            }
            for (let i=turn;i<to2col;i++){
              board[to2row][i] = "floor";
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
    let notPlaced = true;
    while (notPlaced){

      let playerRow = this.randomNumber(rooms[n].locationRow, (rooms[n].locationRow + rooms[n].height)-1);
      let playerCol = this.randomNumber(rooms[n].locationCol, (rooms[n].locationCol + rooms[n].width)-1);
      let board = this.state.valBoard.slice();
      if (board[playerRow][playerCol] === "floor"){
        board[playerRow][playerCol] = "player";
        notPlaced = false;
        this.setState({
          valBoard: board,
          playerRow: playerRow,
          playerCol: playerCol,
        })
      } else{
        continue;
      }
    }

    return Promise.resolve('Success');
  }

  placeGameObjects(object, numberOfObjects){
    let rooms = this.state.rooms.slice();
    let board = this.state.valBoard.slice();
    let enemies= this.state.enemies.slice();
    let boss = Object.assign({}, this.state.boss);
    let notPlaced = true;

    for(let i=0; i<numberOfObjects;i++){
      while(notPlaced){
        let n = this.randomNumber(0,rooms.length-1);
        let row = this.randomNumber(rooms[n].locationRow, (rooms[n].locationRow + rooms[n].height)-1);
        let col = this.randomNumber(rooms[n].locationCol, (rooms[n].locationCol + rooms[n].width)-1);
        if (board[row][col] === "floor"){
          if(object !== "boss"){
            board[row][col] = object;
            notPlaced = false;
          }
          if(object === "enemy"){
            let newEnemy = {health: this.randomNumber(this.state.dungeonFloor*10, this.state.dungeonFloor*13), level: this.state.dungeonFloor, row:row, col:col}
            enemies.push(newEnemy);
          }
          if(object === "boss"){
            if(board[row][col+1] === "floor" && board[row+1][col] === "floor" && board[row+1][col+1] === "floor"){
              board[row][col] = object;
              board[row][col+1] = object;
              board[row+1][col] = object;
              board[row+1][col+1] = object;
              boss.row = row;
              boss.row1 = row+1;
              boss.col = col;
              boss.col1 = col+1;
              notPlaced = false;
            }
          }

          this.setState({
            valBoard: board,
            enemies: enemies,
            boss: boss,
          })
        } else {
          //if randomly selected cell is a wall
          continue;
        }
      }
      notPlaced = true;
    }
    return Promise.resolve('Success');
  }

  validMove(row,col){
    let board = this.state.valBoard.slice();
    if(row >= 0 && row < 20 && col >=0 && col <80 && board[row][col] !== "wall"){
      return true;
    }
    return false;
  }

  fightEnemy(row,col){
    //find out which monster it is based on row/col
    let enemies = this.state.enemies.slice()
    let player = Object.assign({}, this.state.player);
    //this is an array of all enemies not selected
    let remainingEnemies = enemies.filter(enemy => (enemy.row !== row || enemy.col !== col));
    //this is an array with the correct enemy object in it
    let enemy = enemies.filter(enemy => (enemy.row === row && enemy.col === col));
    let playerAttack = Math.round(this.randomNumber(player.weapon.damage/2 * player.level, (player.weapon.damage * player.level)-1));

    enemy[0].health = enemy[0].health - playerAttack;
    if(enemy[0].health > 0){
      remainingEnemies.push(enemy[0]);
      let enemyAttack = Math.round(this.randomNumber(this.state.dungeonFloor * 9, this.state.dungeonFloor * 10));
      player.health = player.health - enemyAttack;
    }
    this.setState({
      enemies: remainingEnemies,
      player: player,
    })
    if(enemy[0].health <= 0){
      player.xpToLevel -= 10;
      if (player.xpToLevel === 0){
        player.level +=1;
        player.xpToLevel = player.level * 60;
        this.setState({
          player: player,
        })
      }
      return "killed";
    }
    if(player.health <= 0){
      return "playerDied";
    }
  }

  fightBoss(){
    let boss = Object.assign({}, this.state.boss);
    let player = Object.assign({}, this.state.player);
    let playerAttack = Math.round(this.randomNumber(player.weapon.damage/2 * player.level, (player.weapon.damage * player.level)-1));

    boss.health = boss.health - playerAttack;
    if (boss.health > 0){
      let enemyAttack = Math.round(this.randomNumber(this.state.dungeonFloor * 10, this.state.dungeonFloor * 11));
      player.health = player.health - enemyAttack;
    }
    this.setState({
      boss: boss,
      player: player,
    })
    if(player.health <= 0){
      player.died = true;
      this.setState({
        player: player,
      })
      return "playerDied";
    }
    if(boss.health <=0){
      return "killed";
    }
  }

  reset(){
    let boss = Object.assign({}, this.state.boss);
    let player = Object.assign({}, this.state.player);
    player.health= 50;
    player.level= 1;
    player.xpToLevel= 60;
    player.weapon= {
      name: "fists",
      damage: 5
    };
    player.died= false;
    boss = {health:100, row:0, row1:0, col:0, col1:0};
    this.setState({
      rooms: [],
      playerRow: 0,
      playerCol: 0,
      weaponCounter:0,
      enemies: [],
      dungeonFloor: 1,
      player: player,
      boss: boss,
    })
    this.setGameEnvironment();
  }
  randomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  checkRendering(row,col){
    let playR = this.state.playerRow;
    let playC = this.state.playerCol;

    if(row === playR -2 || row === playR -1 || row === playR || row === playR +1 || row === playR +2){
      if(col === playC -2 || col === playC -1 || col === playC || col === playC +1 || col === playC +2 ){
        return "Visible"
      }
    }
    if (row === playR -4 || row === playR -3 || row === playR -2 || row === playR -1 || row === playR || row === playR +1 || row === playR +2 ||row === playR +3 || row === playR +4){
      if(col === playC -4 || col === playC -3 || col === playC -2 || col === playC -1 || col === playC || col === playC +1 || col === playC +2 || col === playC +3 || col === playC +4 ){
        return "Faint";
      }
    }
    return "Invisible";
  }

  render() {
    return (
      <div className="App">
          <div className="row page">
            <div className="col-md-8">
              <div className="row">
                <div className="col-md-12 title d-none d-sm-block"><h1>Rogue-like Dungeon Crawler</h1></div>
              </div>
              <div className="row">
                <div className="col-md-12 col-sm-12 col-6 d-inline d-md-none stats"><Stats player={this.state.player} dungeonFloor={this.state.dungeonFloor}/></div>
                <div className="col-6 d-inline d-sm-none"><Guide /></div>
              </div>

              <div className="row">
                <div className="col-md-12 gameWindow"><Grid board={this.state.valBoard} checkRendering={this.checkRendering} playerRow={this.state.playerRow} playerCol={this.state.playerCol} dark={this.state.dark}/></div>
              </div>

            </div>
            <div className="col-md-4">
              <div className="row">
                <div className="col-md-12 d-none d-md-block stats"><Stats player={this.state.player} dungeonFloor={this.state.dungeonFloor}/></div>
              </div>
              <div className="row">
                <div className="col-md-12 d-none d-sm-block"><Guide /> <AddButton onClick={this.toggleDarkness} /></div>
              </div>
            </div>
            <div className="simple-keyboard d-block d-sm-none"></div>

            <div className="col-12 d-block d-md-none d-sm-none toggle"><AddButton onClick={this.toggleDarkness} /></div>

          </div>
      </div>
    )
  }
}

export default App;
