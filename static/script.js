document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    //the number of squares in each row and the number of rows in the grid
    const width = 10;
    const height = 21;
    //array holds the HTML elements that make up the game grid
    const gridElements = new Array(height);
    for (let i = 0; i < height; i++) {
        gridElements[i] = new Array(width);
        for (let j = 0; j < width; j++) {
            let div = document.createElement('div');
            div.classList.add('square');
            //assigning the div element to the corresponding position in gridElements (i.e. the ith row and jth column)
            gridElements[i][j] = div;
            //if it's the last row, add the 'taken' class
            if (i === height - 1) {
            div.classList.add('taken');
            }
            grid.appendChild(div);
        }
    }

    //to work with all the squares in the grid and turn it into an array
    let squares = Array.from(document.querySelectorAll('.grid div')) 
    const scoreDisplay = document.getElementById('score')
    const startBtn = document.getElementById('start-button')
    const pauseBtn = document.getElementById('pause-button')
    const musicBtn = document.getElementById('music-button')
    const i = document.querySelector('i')
    const timer= document.getElementById('timer')
    const lines= document.getElementById('lines')
    const level= document.getElementById('level')
    let animationId;
    let isPlaying = false
    let isPaused = false
    let isGameOver = false
    let nextRandom = 0
    let score = 0
    let rowsRemoved = 0
    let playedTime
    let pausedTime = 0
    let totalSeconds = 0
    let music = new Audio()
    music.src = 'static/tetrismusic.mp3'
    music.volume = 0.3
    music.loop = true
    let musicOff = false
    let music2 = new Audio()
    music2.src = 'static/gameover.wav'
    music2.volume = 0.3
    let music3 = new Audio()
    music3.src = 'static/row.wav'
    music3.volume = 0.1
    let music4 = new Audio()
    music4.src = 'static/winning.wav'
    music4.volume = 0.3
    musicBtn.addEventListener('click', () => {
        if (musicOff) {
            music.play()
            musicOff = false
            i.classList = 'fas fa-volume-up';
        } else {
            music.pause()
            musicOff = true
            i.classList = 'fas fa-volume-mute';
        }
    })
    
    //Tetrominoes and their different positions
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ]
    
      const zTetromino = [
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1],
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1]
    ]
    
      const tTetromino = [
        [1,width,width+1,width+2],
        [1,width+1,width+2,width*2+1],
        [width,width+1,width+2,width*2+1],
        [1,width,width+1,width*2+1]
    ]
    
      const oTetromino = [
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1]
    ]
    
      const iTetromino = [
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3],
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3]
    ]
    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]
    const colors = ['#a8a3cf', '#ca9dd7', '#d3f5f8', '#b1e8ed', '#fd94b4', '#714288', 'white']
    
    let currentPosition = 4 //the upper left square of the teromino
    let currentRotation = 0 //the first position of the teromino
    let random = Math.floor(Math.random()*theTetrominoes.length)
    //tetromino is selected randombly and always takes the first position of the randomly selected teromino
    let current = theTetrominoes[random][currentRotation]; 
    
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];
        })
    }

    function unDraw() {
        current.forEach(index => {
            //removing class and removing color
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    function control (event) {
        //if game is paused, don't allow arrow keys to move the tetromino
        if (isPaused) {
            return;
        }
        //block default browser behaviors interfering with actions. 
        event.preventDefault();

        if(event.keyCode === 37) {
            moveLeft();
        } else if (event.keyCode === 39) {
            moveRight();
        } else if (event.keyCode === 38) {
            rotate();
        } else if (event.keyCode === 40) {
            moveDown();
        }
    }
    
    document.addEventListener('keydown', control);

    let levelMessage = ""; 
    function gameLoop() {
        //check if game is paused, exit loop if true
        if (isPaused) return; 
        animationId = requestAnimationFrame(gameLoop);
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - playedTime;
        let speed = 1000; 
        //adjusting the speed based on the player's score
        if (score >= 20) {
            speed = 500; 
            levelMessage = "You've reached level 2.";
            level.innerHTML = 2;
        }
        if (score >= 40) {
            speed = 250;
            levelMessage = "You've reached level 3. Keep going!";
            level.innerHTML = 3;
        }
        if (score >= 60) {
            speed = 150; 
            levelMessage = "You've reached level 4. The last one!";
            level.innerHTML = 4;
        }

        if (elapsedTime > speed) {
            moveDown();
            playedTime = currentTime;
            if (levelMessage !== "") {
                displayMessage(levelMessage);
            }
        }
    }

    const messageElement = document.getElementById('level-message');

    function displayMessage(message) {
        messageElement.textContent = message;
    }

    function moveDown() {
        if (isGameOver) return;
        unDraw(); //delete the tetromino from previous place
        currentPosition += width; //change the position of the tetromino
        draw(); //appear the tetromino in new place
        freeze(); //checking every second if the tetromino has to be freezed 
    }

    function freeze() {
        //checking if some (not each) of the items in our array is true, meaning some of the squares of the current tetromino contains classname taken.
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            //changing each square of the tetromino to classname taken
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            //start a new teromino falling
            random = nextRandom;
            nextRandom = Math.floor(Math.random()*theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        }
    }

    function moveLeft() {
        if (isGameOver) return;
        unDraw();
        //if one of the indexes is in the gridsquare of 10 and you are dividing it with 10 (width) then it is on the left side. It goes also with 20, 30, 40 and so on.
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        if(!isAtLeftEdge) {
            //if it is not on the left, then we allow it to move to the left, meaning -1 is moving it to left
            currentPosition -= 1; 
        }
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1; 
        }
        draw();
    }

    function moveRight() {
        if (isGameOver) return;
        unDraw();
        //if the result equals with 9, 18, 27 and so on, meaning that one of the tetromino square is on the right edge
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
        if(!isAtRightEdge) {
            currentPosition += 1; 
        }
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    function rotate() {
        if (isGameOver) return;
        unDraw();
        //at first the currentRotation is 0
        currentRotation ++;
        //if the current rotation gets to 3, making it back to 0, because each tetromino have 4 options 
        if(currentRotation === current.length) { 
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        checkRotatedPosition();
        draw();
    }

    function checkRotatedPosition(P){
        P = P || currentPosition;       
        if ((P+1) % width < 4) {            
            if (isAtRight()){            
                currentPosition += 1;    
                checkRotatedPosition(P); 
                }
        } else if (P % width > 5) {
            if (isAtLeft()){
                currentPosition -= 1;
                checkRotatedPosition(P);
            }
        }
    }

    function isAtRight() {
        return current.some(index=> (currentPosition + index + 1) % width === 0);  
    }
      
    function isAtLeft() {
        return current.some(index=> (currentPosition + index) % width === 0);
    }

    //show up-next tetromino in mini-grid display
    const miniGrid = document.querySelector('.mini-grid');
    const miniGridWidth = 5;
    const miniGridHeight = 5;
    const miniGridElements = new Array(miniGridHeight);
    for (let i = 0; i < miniGridHeight; i++) {
        miniGridElements[i] = new Array(miniGridWidth);
        for (let j = 0; j < miniGridWidth; j++) {
            let miniDiv = document.createElement('div');
            miniDiv.classList.add('square');
            miniGridElements[i][j] = miniDiv;
            miniGrid.appendChild(miniDiv);
        }
    }

    //to work with all the squares in the grid and turn it into an array
    let displaySquares = Array.from(document.querySelectorAll('.mini-grid div'));
    const displayWidth = 5;
    const displayIndex = 6;
    //the Tetrominos without rotations
    const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
    ];

    function displayShape() {
        //remove any trace of a tetromino from the entire mini-grid
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        })
        upNextTetrominoes[nextRandom].forEach( index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
        })
    }

    function togglePause() {
        if (isGameOver) return;
        isPaused = !isPaused;
        if (isPaused) {
            //game paused
            pauseBtn.innerHTML = "Resume";
            clearInterval(timerInterval);
            cancelAnimationFrame(animationId);
            music.pause();
            //store the timestamp when the game was paused
            pausedTime = new Date().getTime(); 
        }else {
            //game resumed
            pauseBtn.innerHTML = "Pause";
            const currentTime = new Date().getTime();
            //update playedTime by adding the duration of pause
            playedTime += currentTime - pausedTime; 
            gameLoop();
            countTimer(); // Resume the timer
            if (!musicOff) {
                music.play();
                musicOff = false;
            } else {
                music.pause();
                musicOff = true;
            }
        }
    }
  
    function startOrResetGame() {
        if (isPlaying) {
            //reset the game
            clearInterval(timerInterval);
            cancelAnimationFrame(animationId);
            location.reload();
        } else {
            //start a new game
            isPlaying = true;
            startBtn.innerHTML = 'Reset';
            playedTime = new Date().getTime();
            countTimer(); 
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            displayShape();
            music.play();
            moveDown();
            gameLoop();
        }
    }
    pauseBtn.addEventListener('click', togglePause);
    startBtn.addEventListener('click', startOrResetGame);

    function addScore() {
        //loops through entire grid
        for (let i = 0; i < 199; i += width) {
            //every qrid square that makes a row
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
            //checking if every square in the defined row has a class taken
            if (row.every(index => squares[index].classList.contains('taken'))) {
                if (!musicOff){
                music3.play();
                }
                score += 10;
                //displaying it to the user
                scoreDisplay.innerHTML = score;
                rowsRemoved++;
                lines.innerHTML = rowsRemoved;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                })
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    function countTimer() {
        timerInterval = setInterval(() => {
            totalSeconds++;
            var hour = Math.floor(totalSeconds / 3600);
            var minute = Math.floor((totalSeconds - hour * 3600) / 60);
            var seconds = totalSeconds - (hour * 3600 + minute * 60);
            if (hour < 10) hour = "0" + hour;
            if (minute < 10) minute = "0" + minute;
            if (seconds < 10) seconds = "0" + seconds;
            timer.innerHTML = hour + ":" + minute + ":" + seconds;
        }, 1000);
    }

    let data
    let playerName
    function enterPlayerName(finaltext) {
        //elements for the input form
        const container = document.getElementById('container');
        const text = document.createElement('span');
        text.textContent = finaltext;
        const input = document.createElement('input');
        input.classList.add('input');
        input.type = 'text';
        input.placeholder = 'Name';
        const submitBtn = document.createElement('button');
        submitBtn.classList.add('submit-button');
        submitBtn.textContent = 'Submit';
      
        //appending elements to the container
        container.appendChild(text);
        container.appendChild(input);
        container.appendChild(submitBtn);
      
        //event listener for the input field
        input.addEventListener('input', () => {
          playerName = input.value;
        });
      
        //event listener for the submit button
        submitBtn.addEventListener('click', () => {
          data = {
            name: playerName,
            score: score,
            time: timer.innerText,
          };
          sendPlayerData();
        });
    }

    function showGameOverText(textContent) {
        //to get a text content "Game Over"
        const gameOverText = document.createElement('div');
        gameOverText.classList.add('game-over');
        gameOverText.innerHTML = textContent;
        //append it to the body element
        grid.appendChild(gameOverText);
    }

    function stop() {
        music.pause();
        clearInterval(timerInterval);
        cancelAnimationFrame(animationId);
        isGameOver = true;
        isPaused = true;
        messageElement.remove()
    }

    //game over with two possible ways- if player fails to complete the game or if player completed the game
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            stop()
            music2.play()
            showGameOverText('Game Over!')
            enterPlayerName('Unfortunately, the economy crashed before you could finish all the levels! However, please enter your name to get to the scoreboard:')
        } else if (score >= 80) {
            stop()
            music4.play()
            showGameOverText('Well Done!')
            enterPlayerName('Congratulations! You were quick enough! Please enter your name to get to the scoreboard:')
        }
    }
            
    function sendPlayerData() {
        fetch('http://localhost:8080/scores', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
            //directing the player to this page
            window.location.href = 'http://localhost:8080/scoreboard?name=' + playerName;
            } else {
            console.error('Error sending player data');
            }
        })
        .catch(error => {
            console.error('Error sending player data:', error);
        });
    }
}) 


