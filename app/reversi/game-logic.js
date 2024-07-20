class game {
    static DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    constructor(size=8, mode='standard') {
        this.size=size
        this.currentPlayer = "Black";
        this.mode = mode;
        this.board = this.initialiseBoard(size);
        this.players = {
            black: {name: 'Player 1', color: "Black"},
            white: {name: 'Player 2', color: "White"}
        };
    }

    /*
    Set starting board for the game
    */
    initialiseBoard(size) {
        let board = Array(size).fill(null).map(() => Array(size).fill(null));
        if (this.mode == 'random') {
            let randRow = this.getRandomInt(this.size - 1);
            let randCol = this.getRandomInt(this.size - 1);
            board[randRow][randCol] = "Black";
            board[randRow][randCol + 1] = "White";
            board[randRow + 1][randCol] = "White";
            board[randRow + 1][randCol + 1] = "Black";
        } else {
            let mid = Math.floor(size / 2);
            board[mid - 1][mid - 1] = "Black";
            board[mid - 1][mid] = "White";
            board[mid][mid - 1] = "White";
            board[mid][mid] = "Black";
        }
        return board;
    }

    /*
    Get random integer for the random variant
    */
    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    /*
    Get an instance of game from realtime database data
    */
    static fromData(boardSize, mode, board, currentPlayer, players) {
        const gameInstance = new game(boardSize, mode);
        gameInstance.board = game.convertSparseObjectTo2DArray(board, boardSize);
        gameInstance.currentPlayer = currentPlayer;
        gameInstance.players = players;
        return gameInstance;
    }

    /*
    Converts and returns the board array from firebase's sparse object
    */
    static convertSparseObjectTo2DArray(boardObject, boardSize) {
        const size = boardSize;
        let boardArray = Array(size).fill(null).map(() => Array(size).fill(null));
    
        // Iterate over keys in the boardObject and fill the boardArray
        Object.keys(boardObject).forEach(rowIndex => {
            Object.keys(boardObject[rowIndex]).forEach(colIndex => {
                boardArray[parseInt(rowIndex)][parseInt(colIndex)] = boardObject[rowIndex][colIndex];
            });
        });
    
        return boardArray;
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
        while (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
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

    /*
    get all valid moves for current player
    */
    getValidMoves(player) {
        let validMoves = [];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                // skip cells that are non empty
                if (this.board[row][col] != null) {
                    continue;
                }
                // Cell has been blocked
                if (this.board[row][col] == 'Blocked') {
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
        while (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
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
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] == 'Blocked') {
                    row.push(null);
                } else {
                    row.push(this.board[i][j]);
                }
            }
            newBoard.push(row);
        }
        this.board = newBoard;
        this.currentPlayer = this.getOpponent();
    }

    /*
    AI makes a move
    */
    aiMove(mode, status, setBoard, setCurrentPlayer, blockModeActive, setBlockModeActive, setAvailableCellsToBlock, setMessage) {
        // Get all valid moves
        const moves = this.getValidMoves(this.currentPlayer);
        // check block mode true here
        if (blockModeActive) {
            const blockedMove = this.getRandValidMove(moves);
            this.blockCell(blockedMove[0], blockedMove[1]);
            setBoard(this.board);
            setBlockModeActive(false); // Exit block mode after setting cell
            setAvailableCellsToBlock(null);
            const text = `Computer blocked a cell. Now it's ${this.players[this.currentPlayer.toLowerCase()].name }'s turn.`
            setMessage(text);
            setCurrentPlayer(this.currentPlayer); // Current player now swapped to user
        } else {
            // AI has moves
            if (moves.length > 0) {
                console.log("ai makes a move")
                const moveSelected = this.getRandValidMove(moves);
                this.makeMove(moveSelected[0], moveSelected[1]);
                setBoard(this.board);
                if (mode != 'block') {
                    setCurrentPlayer(this.currentPlayer);
                }        

                if (mode == 'block') {
                    // Get all valid moves of user
                    const validMoves = this.getValidMoves(this.currentPlayer);
                    // if user has only 1 validmove, do not enter block mode, switch to user's turn
                    if (validMoves.length > 1) {
                        setBlockModeActive(true); // Computer enters state to block move
                        setAvailableCellsToBlock(validMoves); // All moves that computer can block
                        setMessage(`Computer is blocking a cell`);
                        // call aiMove again for ai to enter block mode
                        setTimeout(() => {
                            this.aiMove(mode, status, setBoard, setCurrentPlayer, true, setBlockModeActive, setAvailableCellsToBlock, setMessage);
                        }, 3000);
                    } else {
                        setMessage(`${this.players[this.currentPlayer.toLowerCase()].name} has only 1 valid move, ${this.players[this.currentPlayer.toLowerCase()].name}'s turn`);
                        // Switch to user's turn
                        setCurrentPlayer(this.currentPlayer);
                    }      
                }     
            }
        }
    }

    /*
    Get some random array from the array of valid moves
    */
    getRandValidMove(moves) {
        const randNum = this.getRandomInt(moves.length - 1);
        return moves[randNum];
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
            // If game mode is reverse reversi, flip winning logic
            if (this.mode == 'reverse') {
                if (currNum > opponentNum) {
                    return {status: "win", winner: this.getOpponent()};
                } else if (opponentNum > currNum) {
                    return {status: "win", winner: this.currentPlayer};
                } else {
                    return {status: "draw"};
                }
            } else {
                if (currNum > opponentNum) {
                    return {status: "win", winner: this.currentPlayer};
                } else if (opponentNum > currNum) {
                    return {status: "win", winner: this.getOpponent()};
                } else {
                    return {status: "draw"};
                }
            }
        }

        // currentPlayer is the opponent, if opponent has no moves, swap back to player
        if (!this.hasValidMove(this.currentPlayer)) {
            // swap back to original player
            this.currentPlayer = this.getOpponent();
            return {status: "skip", message: `${this.players[this.getOpponent().toLowerCase()].name} has no valid moves. Turn skipped.`};
        }

        return {status: "continue"};
    }

    /*
    Updates board with blocked cell
    */
    blockCell(row, col) {
        this.board[row][col] = 'Blocked';
        let newBoard = []
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(this.board[i][j]);
            }
            newBoard.push(row);
        }
        this.board = newBoard;
    }
}

export default game;