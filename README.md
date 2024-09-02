# Tetris Game

This project has been made according to the task and its sub-tasks described [here](https://github.com/01-edu/public/tree/master/subjects/make-your-game).

This is a JavaScript implementation of the classic game Tetris. It uses HTML, CSS, JavaScript and Go to create a grid-based game interface and allows players to control falling tetrominoes to clear rows and score points.
To win the game you have to complete 4 levels. At each level the speed of tetrominoes goes little bit faster. 
Also after the game you can insert your name to see your position in the scoreboard. 

## How to use

* Option one with Docker
    - You should have Docker installed. If you don't have, install [Docker](https://docs.docker.com/get-started/get-docker/)
    - To build the image and run the container use following commands:
        - for building the docker image: docker build -t dockerize .
        - for running the docker container: docker run -it -p 8080:8080 dockerize
    - To check the app, open http://localhost:8080 in a browser. 
    - To terminate the server click CTRL + "C".

* Option two directly from your terminal
    - You should have Go installed. If you don't have, install [Go](https://go.dev/doc/install)
    - Type in your terminal: go run main.go
    - Open http://localhost:8080
    - To stop the server, click Ctrl + C in your terminal

## Code Architecture

Folder <code>static</code> contains the JavaScript codes, HTML files, css file and music effects for the game.

The script.js code sets up the game grid, handles user input, controls the movement and rotation of tetrominoes, and manages game logic such as scoring, line clearing, levels, and game over detection, and handles start, pause, resume and reset buttons. Scoreboard.js code is to organize all the data (player name, rank, score, time and position prercentile) on a scoreboard. 

And the purpose of main.go file is to create a web server for a Tetris game. It handles HTTP requests to different routes: "/" serves the Tetris page, "/scores" allows viewing information in JSON format, and "/scoreboard" displays the scoreboard for the players.

## Authors
- [@elinat](https://01.kood.tech/git/elinat)
