class game {
    static DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    constructor() {
        this.currentPlayer = "black";
        this.board = this.initialiseBoard();
    }

    // Set starting board for the game
    initialiseBoard() {
        let board = Array(8).fill(null).map(row => Array(8).fill(null));
        board[3][3] = "black";
        board[3][4] = "white";
        board[4][3] = "white";
        board[4][4] = "black";
        return board;
    }

    /*
    Returns true if there is an opposing piece in current direction
    */
    hasOpponent(row, col, x, y, player) {
        let newRow = row + x;
        let newCol = col + y;
        let opponent = player == "black" ? "white" : "black";
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
        let opponent = player == "black" ? "white" : "black";
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
        let validMoves = this.getValidMoves(this.currentPlayer);
        // Only consider if move selected part of validMoves
        if (validMoves.some(item => item[0] == row && item[1] == col)) {
            for (let [x, y] of game.DIRECTIONS) {
                this.flipPieces(row, col, x, y, this.currentPlayer);
            }
        }
    }
}

export default game;