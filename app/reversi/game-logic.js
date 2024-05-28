class game {
    static DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    constructor() {
        this.currentPlayer = "Black";
        this.board = this.initialiseBoard();
        this.players = {
            black: {name: localStorage.getItem('username'), color: "Black"},
            white: {name: 'Player 2', color: "White"}
        };
    }

    // Set starting board for the game
    initialiseBoard() {
        let board = Array(8).fill(null).map(row => Array(8).fill(null));
        board[3][3] = "Black";
        board[3][4] = "White";
        board[4][3] = "White";
        board[4][4] = "Black";
        return board;
    }

    /*
    Returns opponent
    */
    getOpponent() {
        return this.currentPlayer == "Black" ? "White" : "Black";
    }

    /*
    Returns true if there is an opposing piece in current direction
    */
    hasOpponent(row, col, x, y, player) {
        let newRow = row + x;
        let newCol = col + y;
        let opponent = player == "Black" ? "White" : "Black";
        let hasOpponentPiece = false;
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            // Check if there is an opponent piece
            if (this.board[newRow][newCol] == opponent) {
                hasOpponentPiece = true;
            } else if (this.board[newRow][newCol] == player) {
                // Check if opponent piece enclosed by current player piece
                return hasOpponentPiece;
            } else {
                break; // Empty cell
            }
            newRow += x;
            newCol += y;
        }
        return false;
    }

    // get all valid moves for current player
    getValidMoves(player) {
        let validMoves = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // skip cells that are non empty
                if (this.board[row][col] != null) {
                    continue;
                }
                // check all 8 directions
                for (let [x, y] of game.DIRECTIONS) {
                    if (this.hasOpponent(row, col, x, y, player)) {
                        validMoves.push([row, col])
                        break;
                    }
                }
            }
        }
        return validMoves;
    }

    /*
    Flip the pieces
    */
    flipPieces(row, col, x, y, player) {
        let newRow = row + x;
        let newCol = col + y;
        let opponent = player == "Black" ? "White" : "Black";
        let toFlip = [[row, col]];
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            // if opponent piece, continue in direction
            if (this.board[newRow][newCol] == opponent) {
                toFlip.push([newRow, newCol]);
            } else if (this.board[newRow][newCol] == player) {
                // Flip all opponent pieces that should be flipped
                for (let [dx, dy] of toFlip) {
                    this.board[dx][dy] = player;
                }
                return;
            } else {
                break; // Empty cell
            }
            newRow += x;
            newCol += y;
        }
    }

    /*
    Select the cell that has been selected and flip the corresponding pieces
    */
    makeMove(row, col) {
        // Only consider if move selected part of validMoves
        if (this.isValidMove(row, col)) {
            for (let [x, y] of game.DIRECTIONS) {
                this.flipPieces(row, col, x, y, this.currentPlayer);
            }
        }
        // Create entirely new board
        let newBoard = []
        for (let i = 0; i < 8; i++) {
            let row = [];
            for (let j = 0; j < 8; j++) {
                row.push(this.board[i][j]);
            }
            newBoard.push(row);
        }
        this.board = newBoard;
        this.currentPlayer = this.getOpponent();
    }

    /*
    Checks if move selected at current index is a valid move
    */
    isValidMove(row, col) {
        let validMoves = this.getValidMoves(this.currentPlayer);
        return validMoves.some(item => item[0] == row && item[1] == col);
    }

    /*
    Checks if current player has any valid moves
    */
    hasValidMove(player) {
        return this.getValidMoves(player).length > 0;
    }

    /*
    Checks if grid is all filled with pieces
    */
    isGridFull() {
        return this.board.every(row => row.every(cell => cell != null));
    }

    /*
    Get number of pieces for current player
    */
    getPieceNumber(player) {
        return this.board.flat().filter(value => value == player).length;
    }

    /*
    Get game status
    */
    checkGameStatus() {
        let currNum = this.getPieceNumber(this.currentPlayer);
        let opponentNum = this.getPieceNumber(this.getOpponent());

        // If grid is full or both players have no valid moves
        if (this.isGridFull() || (!this.hasValidMove(this.currentPlayer) && !this.hasValidMove(this.getOpponent()))) {
            if (currNum > opponentNum) {
                return {status: "win", winner: this.currentPlayer};
            } else if (opponentNum > currNum) {
                return {status: "win", winner: this.getOpponent()};
            } else {
                return {status: "draw"};
            }
        }

        // currentPlayer is the opponent, if opponent has no moves, swap back to player
        if (!this.hasValidMove(this.currentPlayer)) {
            // swap back to original player
            this.currentPlayer = this.getOpponent();
            return {status: "skip", message: `${this.getOpponent()} has no valid moves. Turn skipped.`};
        }

        return {status: "continue"};
    }
}

export default game;