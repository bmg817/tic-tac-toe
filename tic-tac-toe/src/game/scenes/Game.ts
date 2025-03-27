import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Game extends Scene {
    board: string[][];
    currentPlayer: string;
    cellSize: number;
    gameOver: boolean;
    constructor() {
        super("Game");
    }

    init() {
        // Initialize game state variables
        this.board = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
        ];
        this.currentPlayer = "X";
        this.cellSize = 200; // assuming a 600x600 game canvas
        this.gameOver = false;
    }

    preload() {
        // Optionally load a background image (or any other assets)
        this.load.setPath("assets");
        this.load.image("background", "bg.png");
    }

    create() {
        // Optionally add a background image stretched to cover the canvas
        this.add.image(300, 300, "background").setDisplaySize(600, 600);

        // Draw the grid lines using a Graphics object
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0x000000, 1);
        // Vertical grid lines
        graphics.strokeLineShape(
            new Phaser.Geom.Line(this.cellSize, 0, this.cellSize, 600)
        );
        graphics.strokeLineShape(
            new Phaser.Geom.Line(this.cellSize * 2, 0, this.cellSize * 2, 600)
        );
        // Horizontal grid lines
        graphics.strokeLineShape(
            new Phaser.Geom.Line(0, this.cellSize, 600, this.cellSize)
        );
        graphics.strokeLineShape(
            new Phaser.Geom.Line(0, this.cellSize * 2, 600, this.cellSize * 2)
        );

        // Create interactive zones for each cell of the grid
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cellX = col * this.cellSize;
                const cellY = row * this.cellSize;
                const zone = this.add
                    .zone(cellX, cellY, this.cellSize, this.cellSize)
                    .setOrigin(0)
                    .setInteractive();
                zone.row = row;
                zone.col = col;
                zone.on("pointerdown", () => {
                    this.handleCellClick(row, col);
                });
            }
        }

        // Let the rest of the app know the current scene is ready.
        EventBus.emit("current-scene-ready", this);
    }

    handleCellClick(row: number, col: number) {
        // Ignore clicks if the game is over or the cell is already taken
        if (this.gameOver || this.board[row][col] !== "") {
            return;
        }

        // Mark the board and draw the player's symbol
        this.board[row][col] = this.currentPlayer;
        this.drawMark(row, col, this.currentPlayer);

        // Check for win or draw conditions
        if (this.checkWin(this.currentPlayer)) {
            this.gameOver = true;
            this.showMessage(`${this.currentPlayer} wins!`);
        } else if (this.checkDraw()) {
            this.gameOver = true;
            this.showMessage("Draw!");
        } else {
            // Switch turns
            this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        }
    }

    drawMark(row: number, col: number, mark: string | string[]) {
        // Calculate center position for the text in the cell
        const posX = col * this.cellSize + this.cellSize / 2;
        const posY = row * this.cellSize + this.cellSize / 2;
        this.add
            .text(posX, posY, mark, {
                fontSize: "120px",
                color: "#000",
            })
            .setOrigin(0.5);
    }

    checkWin(player: string) {
        // Check rows for win
        for (let i = 0; i < 3; i++) {
            if (
                this.board[i][0] === player &&
                this.board[i][1] === player &&
                this.board[i][2] === player
            ) {
                return true;
            }
        }
        // Check columns for win
        for (let j = 0; j < 3; j++) {
            if (
                this.board[0][j] === player &&
                this.board[1][j] === player &&
                this.board[2][j] === player
            ) {
                return true;
            }
        }
        // Check diagonals for win
        if (
            this.board[0][0] === player &&
            this.board[1][1] === player &&
            this.board[2][2] === player
        ) {
            return true;
        }
        if (
            this.board[0][2] === player &&
            this.board[1][1] === player &&
            this.board[2][0] === player
        ) {
            return true;
        }
        return false;
    }

    checkDraw() {
        // If any cell is empty, it's not a draw yet
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i][j] === "") {
                    return false;
                }
            }
        }
        return true;
    }

    showMessage(message: string | string[]) {
        // Create a semi-transparent overlay and display the message
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillRect(0, 250, 600, 100);
        this.add
            .text(300, 300, message, {
                fontSize: "40px",
                color: "#000",
            })
            .setOrigin(0.5);
    }
}

