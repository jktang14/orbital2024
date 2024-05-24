class game {
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
        const DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // skip cells that are non empty
                if (this.board[row][col] != null) {
                    continue;
                }
                // check all 8 directions
                for (let [x, y] of DIRECTIONS) {
                    if (this.hasOpponent(row, col, x, y, player)) {
                        validMoves.push([row, col])
                        break;
                    }
                }
            }
        }
        return validMoves;
    }
}