# Tetris Game

This is a JavaScript implementation of the classic game Tetris. It uses HTML, CSS, JavaScript and Go to create a grid-based game interface and allows players to control falling tetrominoes to clear rows and score points.
After the game you can insert your name to see your position in the scoreboard. 

## Usage

* Type in your terminal: go run main.go
* In the Windows Security alert cklick "Allow access"
* Open http://localhost:8080
* Play the game
* To stop the server, click Ctrl + C in your terminal

Folder <code>static</code> contains the JavaScript codes, css file and music effects for the game.

The script.js code sets up the game grid, handles user input, controls the movement and rotation of tetrominoes, and manages game logic such as scoring, line clearing, and game over detection, and handles start, pause, resume and reset buttons. Scoreboard.js code is to organize all the data (player name, rank, score, time and position prercentile) on a scoreboard. 

And the purpose of main.go file is to create a web server for a Tetris game. It handles HTTP requests to different routes: "/" serves the Tetris page, "/scores" allows viewing information in JSON format, and "/scoreboard" displays the scoreboard for the players.

## Authors
- [@elinat](https://01.kood.tech/git/elinat)
- [@Anni.M](https://01.kood.tech/git/Anni.M)