var board = [], tmpBoard = [], pieceMap = [], canvas = null, WIDTH = 9, HEIGHT = 16, SIZE = 30, INTERVAL = 1100;
var score = 0, level = 0, state = 'waiting', currentY = -2, currentX = 0, collide = false, timer = null, _lock = false, keyListener = null, mouseListener = null;
var pieces = [[[1,1,1],[0,1,0]],[[0,0,0,0],[1,1,1,1]],[[1,1],[1,1]],[[1,1,1],[0,0,1]]];

function init() {
  canvas = document.getElementById("tetris");
  canvas.style.width = WIDTH * SIZE;
  canvas.style.height = HEIGHT * SIZE;

  modal("Quieres iniciar un juego", "INICIAR", function() { startGame(); hideModal(); })
}

function startGame() {
  level = score = 0;
  INTERVAL = 1100;

  if (keyListener == null) {
    window.removeEventListener("keydown", keyListener);  
    keyListener = window.addEventListener("keydown", event => {
      if (event.keyCode === 37) {
        move(currentX-1, currentY);
      } else if (event.keyCode === 39) {
        move(currentX+1, currentY);
      } else if (event.keyCode === 40) {
        move(currentX, currentY+1);
      } else if (event.keyCode === 38 || event.keyCode === 13) {
        rotate();
      } else if (event.keyCode === 68) {
        debugger
      }
    });
    
    mouseListener = window.addEventListener("click", event => {
      var dec = event.pageX*1/window.innerWidth
      if (dec < .33) {
        move(currentX-1, currentY);
      } else if (dec > .33 && dec < .66) {
        move(currentX, currentY+1);
      } else {
        move(currentX+1, currentY);
      }
    });

    document.getElementById('btnRotate').addEventListener('click', event => {
      event.stopPropagation();
      rotate();
    })
  }
  updateLevel()
}

function makePiece() {
  pieceMap = deepCopy(pieces[Math.floor(Math.random() * 4)]);
}

function emptyMulti(w, h) {
  return Array(w).fill(0).map(x => Array(h).fill(0))
}

function deepCopy(a) {
  return JSON.parse(JSON.stringify(a));
}

function tryMove(x, y) {
  if (x < 0 || x >= WIDTH) return 0;

  tmpBoard = emptyMulti(HEIGHT, WIDTH);
  found = false;
  for (var i = 0; i < HEIGHT; i++) {
    for (var j = 0; j < WIDTH; j++) {
      if ((i >= y && j >= x) && !found) {
        found = true;
        for (var n = 0, maxn = pieceMap.length; n < maxn; n++) {
          for (var m = 0,maxm = pieceMap[0].length; m < maxm; m++) {
            if (pieceMap[n][m] == 1) {
              if (x+m >= WIDTH || y+n >= HEIGHT) {
                return 0;
              } else if (y+n >= 0) {
                if (board[y+n][x+m] == 1) {
                  return 1;
                } else {
                  tmpBoard[y+n][x+m] = 1;
                  if (y+n+1 >= HEIGHT || board[y+n+1][x+m] == 1) {
                    collide = true;
                  }
                }
              }
            }
          }
        }
        break;
      }
    }
  }
  return tmpBoard;
}
function loop() {
  move(currentX, currentY+1);
}
function move(x, y) {
  if (_lock) return;
  _lock = true;
  if (state == 'collide') {
    state = 'moving';
    makePiece();
  }
  result = tryMove(x, y);

  if (result == 0 || result == 1) {
    _lock = false;
    return;
  } else {
    currentX = x;
    currentY = y;
    tmpBoard = deepCopy(result);
  }

  draw(join(tmpBoard));

  checkCollide();
  _lock = false;
}

function checkCollide() {
  if (collide) {
    if (currentY < 1) {
      youLose()
    }
    collide = false;
    currentX = Math.floor(Math.random() * 5);
    currentY = -2;
    state = 'collide';
    board = join(tmpBoard);
    
    checkCompleteLines()
  }
}

function join(tmpBoard) {
  var result =  deepCopy(board)
  for (var i = 0; i < HEIGHT; i++) {
    for (var j = 0; j < WIDTH; j++) {
      result[i][j] = (result[i][j]+tmpBoard[i][j]);
    }
  }
  return result;
}

function checkCompleteLines() {
  var bef_lines = 0, lines_complete = 0, h = HEIGHT;
  var _board = deepCopy(board)
  do {
    bef_lines = lines_complete;
    for (var i = 0; i < h; i++) {
      if (_board[i].indexOf(0) == -1) {
        _board.splice(i, 1);
        h--;
        lines_complete++;
      }
    }
  } while (bef_lines != lines_complete);

  if (lines_complete) {
    for (var i = 0; i < lines_complete; i++) _board.unshift((Array(WIDTH)).fill(0))
    board = deepCopy(_board)

    score += lines_complete*10;
    updateUIScore(score)
    if (score>level*100) {
      updateLevel();
    }
  }
}

function updateLevel() {
  updateUILevel(++level);
  INTERVAL -= 100;
  
  if (timer != null) {
    clearInterval(timer)
    timer = null
  }

  board = emptyMulti(HEIGHT, WIDTH);

  state = 'moving'
  makePiece()

  timer = setInterval(loop, INTERVAL);
}

function youLose() {
  clearInterval(timer)
  modal("Has perdido!, Quieres iniciar un nuevo JUEGO?", "INICIAR", function() { startGame(); hideModal(); })
}

function rotate() {
  if (state == 'moving') {
    let result = [];
    for(let i = 0; i < pieceMap[0].length; i++) {
        let row = pieceMap.map(e => e[i]).reverse();
        if (row[row.length-1] == 1 && currentX+row.length-1 >= WIDTH) {
          return;
        }
        result.push(row);
    }
    pieceMap = deepCopy(result)
    currentY--;
    loop()
  }
}

function draw(mBoard) {
  var ctx = canvas.getContext("2d");
  ctx.canvas.width = WIDTH*SIZE;
  ctx.canvas.height = HEIGHT*SIZE;
	ctx.clearRect(0, 0, WIDTH*SIZE, HEIGHT*SIZE);

	for (var i = 0; i < HEIGHT; i++) {
    	for (var j = 0; j < WIDTH; j++) {
        ctx.beginPath();
        ctx.rect(j*SIZE, i*SIZE, SIZE, SIZE);
        ctx.strokeStyle = "#cccccc";
        ctx.stroke();

        if (mBoard[i][j] == 1) {
          ctx.beginPath();
          ctx.arc(j*(SIZE)+(SIZE/2), i*(SIZE)+(SIZE/2), 15, 0, 2*Math.PI, false);
          ctx.fillStyle = "#AB47BC"
          ctx.fill();
          ctx.stroke();
        }
      }
    }
}
init();
