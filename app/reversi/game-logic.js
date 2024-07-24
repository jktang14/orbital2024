import DeepCopy from "../components/deep-copy";
class game {
    static DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    static positionalWeights6 = [
        [100, -20, 10, 10, -20, 100],
        [-20, -50, -2, -2, -50, -20],
        [10, -2, -1, -1, -2, 10],
        [10, -2, -1, -1, -2, 10],
        [-20, -50, -2, -2, -50, -20],
        [100, -20, 10, 10, -20, 100]
    ];
    static positionalWeights8 = [
        [100, -20, 10,  5,  5, 10, -20, 100],
        [-20, -50, -2, -2, -2, -2, -50, -20],
        [10, -2, -1, -1, -1, -1, -2, 10],
        [5,  -2, -1, -1, -1, -1, -2, 5],
        [5,  -2, -1, -1, -1, -1, -2, 5],
        [10, -2, -1, -1, -1, -1, -2, 10],
        [-20, -50, -2, -2, -2, -2, -50, -20],
        [100, -20, 10,  5,  5, 10, -20, 100]
    ]; 
    static positionalWeights10 = [
        [100, -20, 10,  5,  5, 5,  5, 10, -20, 100],
        [-20, -50, -2, -2, -2, -2, -2, -2, -50, -20],
        [10, -2, -1, -1, -1, -1, -1, -1, -2, 10],
        [5,  -2, -1, -1, -1, -1, -1, -1, -2, 5],
        [5,  -2, -1, -1, -1, -1, -1, -1, -2, 5],
        [5,  -2, -1, -1, -1, -1, -1, -1, -2, 5],
        [5,  -2, -1, -1, -1, -1, -1, -1, -2, 5],
        [10, -2, -1, -1, -1, -1, -1, -1, -2, 10],
        [-20, -50, -2, -2, -2, -2, -2, -2, -50, -20],
        [100, -20, 10,  5,  5, 5,  5, 10, -20, 100]
    ];
    static positionalWeights12 = [
        [100, -20, 10,  5,  5,  5, 5, 5,  5, 10, -20, 100],
        [-20, -50, -2, -2, -2, -2, -2, -2, -2, -2, -50, -20],
        [10, -2, -1, -1, -1, -1, -1, -1, -1, -1, -2, 10],
        [5,  -2, -1, -1, -1, -1, -1, -1, -1, -1, -2, 5],
        [5,  -2, -1, -1, -1, -1, -1, -1, -1, -1, -2, 5],
        [5,  -2, -1, -1, -1, -1, -1, -1, -1, -1, -2, 5],
        [5,  -2, -1, -1, -1, -1, -1, -1, -1, -1, -2, 5],
        [5,  -2, -1, -1, -1, -1, -1, -1, -1, -1, -2, 5],
        [5,  -2, -1, -1, -1, -1, -1, -1, -1, -1, -2, 5],
        [10, -2, -1, -1, -1, -1, -1, -1, -1, -1, -2, 10],
        [-20, -50, -2, -2, -2, -2, -2, -2, -2, -2, -50, -20],
        [100, -20, 10,  5,  5,  5, 5, 5,  5, 10, -20, 100]
    ];
    
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
    getOpponent(player) {
        return player == "Black" ? "White" : "Black";
    }

    /*
    Returns true if there is an opposing piece in current direction
    */
    hasOpponent(row, col, x, y, player, board) {
        let newRow = row + x;
        let newCol = col + y;
        let opponent = player == "Black" ? "White" : "Black";
        let hasOpponentPiece = false;
        while (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
            // Check if there is an opponent piece
            if (board[newRow][newCol] == opponent) {
                hasOpponentPiece = true;
            } else if (board[newRow][newCol] == player) {
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
    getValidMoves(player, board) {
        let validMoves = [];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                // skip cells that are non empty
                if (board[row][col] != null) {
                    continue;
                }
                // Cell has been blocked
                if (board[row][col] == 'Blocked') {
                    continue;
                }
                // check all 8 directions
                for (let [x, y] of game.DIRECTIONS) {
                    if (this.hasOpponent(row, col, x, y, player, board)) {
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
    flipPieces(row, col, x, y, player, board) {
        let newRow = row + x;
        let newCol = col + y;
        let opponent = player == "Black" ? "White" : "Black";
        let toFlip = [[row, col]];
        while (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
            // if opponent piece, continue in direction
            if (board[newRow][newCol] == opponent) {
                toFlip.push([newRow, newCol]);
            } else if (board[newRow][newCol] == player) {
                // Flip all opponent pieces that should be flipped
                for (let [dx, dy] of toFlip) {
                    board[dx][dy] = player;
                }
                return toFlip.length;
            } else {
                break; // Empty cell
            }
            newRow += x;
            newCol += y;
        }
        return 0;
    }

    /*
    Select the cell that has been selected and flip the corresponding pieces
    */
    makeMove(status, row, col, player, board) {
        // Only consider if move selected part of validMoves
        let flippedBoard = DeepCopy(board);
        if (this.isValidMove(row, col, player, board)) {
            for (let [x, y] of game.DIRECTIONS) {
                this.flipPieces(row, col, x, y, player, flippedBoard);
            }
        }
        // Create entirely new board
        let newBoard = []
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                if (flippedBoard[i][j] == 'Blocked') {
                    row.push(null);
                } else {
                    row.push(flippedBoard[i][j]);
                }
            }
            newBoard.push(row);
        }
        // Only set if for hard AI, move made by user
        this.board = newBoard;
        this.currentPlayer = this.getOpponent(this.currentPlayer);
    }

    /*
    Get child board states for minimax algorithm
    */
    getChildBoard(status, row, col, player, board) {
        let flippedBoard = DeepCopy(board);
        if (this.isValidMove(row, col, player, board)) {
            for (let [x, y] of game.DIRECTIONS) {
                this.flipPieces(row, col, x, y, player, flippedBoard);
            }
        }
        // Create entirely new board
        let newBoard = []
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                if (flippedBoard[i][j] == 'Blocked') {
                    row.push(null);
                } else {
                    row.push(flippedBoard[i][j]);
                }
            }
            newBoard.push(row);
        }
        return newBoard;
    }

    /*
    AI makes a move
    */
    aiMove(mode, status, setBoard, setCurrentPlayer, blockModeActive, setBlockModeActive, setAvailableCellsToBlock, setMessage) {
        // Get all valid moves
        const moves = this.getValidMoves(this.currentPlayer, this.board);
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
                if (status == 'hardAI') {
                    if (mode == 'reverse') {
                        this.makeBestReverseMove(this.board, this.currentPlayer);
                    } else {
                        this.makeBestAiMove(status, this.board, this.currentPlayer, 3);
                    }
                } else {
                    const moveSelected = this.getRandValidMove(moves);
                    this.makeMove(status, moveSelected[0], moveSelected[1], this.currentPlayer, this.board);
                }

                setBoard(this.board);
                if (mode != 'block') {
                    setCurrentPlayer(this.currentPlayer);
                }        

                if (mode == 'block') {
                    // Get all valid moves of user
                    const validMoves = this.getValidMoves(this.currentPlayer, this.board);
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
    isValidMove(row, col, player, board) {
        let validMoves = this.getValidMoves(player, board);
        return validMoves.some(item => item[0] == row && item[1] == col);
    }

    /*
    Checks if current player has any valid moves
    */
    hasValidMove(player, board) {
        return this.getValidMoves(player, board).length > 0;
    }

    /*
    Checks if grid is all filled with pieces
    */
    isGridFull(board) {
        return board.every(row => row.every(cell => cell != null));
    }

    /*
    Get number of pieces for current player
    */
    getPieceNumber(player, board) {
        return board.flat().filter(value => value == player).length;
    }

    /*
    Get game status
    */
    checkGameStatus() {
        let currNum = this.getPieceNumber(this.currentPlayer, this.board);
        let opponentNum = this.getPieceNumber(this.getOpponent(this.currentPlayer), this.board);

        // If grid is full or both players have no valid moves
        if (this.isGridFull(this.board) || (!this.hasValidMove(this.currentPlayer, this.board) && !this.hasValidMove(this.getOpponent(this.currentPlayer), this.board))) {
            // If game mode is reverse reversi, flip winning logic
            if (this.mode == 'reverse') {
                if (currNum > opponentNum) {
                    return {status: "win", winner: this.getOpponent(this.currentPlayer)};
                } else if (opponentNum > currNum) {
                    return {status: "win", winner: this.currentPlayer};
                } else {
                    return {status: "draw"};
                }
            } else {
                if (currNum > opponentNum) {
                    return {status: "win", winner: this.currentPlayer};
                } else if (opponentNum > currNum) {
                    return {status: "win", winner: this.getOpponent(this.currentPlayer)};
                } else {
                    return {status: "draw"};
                }
            }
        }

        // currentPlayer is the opponent, if opponent has no moves, swap back to player
        if (!this.hasValidMove(this.currentPlayer, this.board)) {
            // swap back to original player
            this.currentPlayer = this.getOpponent(this.currentPlayer);
            return {status: "skip", message: `${this.players[this.getOpponent(this.currentPlayer).toLowerCase()].name} has no valid moves. Turn skipped.`};
        }

        return {status: "continue"};
    }

    /*
    Updates board with blocked cell
    */
    blockCell(row, col, board) {
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

    /*
    Check if board is an endgame
    */
    isTerminal(player, board) {
        return (this.isGridFull(board) || (!this.hasValidMove(player, board) && !this.hasValidMove(this.getOpponent(player), board)));
    }
  
    /*
    Scoring for use in minimax algorithm from AI's perspective
    */
    getBoardScore(board) {
        let player = "White";
        let opponent = "Black";
        let positionalWeight;
        let score = 0;
        let aiFrontier = 0;
        let opponentFrontier = 0;

        if (this.size == 6) {
            positionalWeight = game.positionalWeights6;
        } else if (this.size == 8) {
            positionalWeight = game.positionalWeights8;
        } else if (this.size == 10) {
            positionalWeight = game.positionalWeights10;
        } else {
            positionalWeight = game.positionalWeights12;
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (board[i][j] == player) {
                    score += positionalWeight[i][j];
                    for (let [x, y] of game.DIRECTIONS) {
                        let newRow = i + x, newCol = j + y;
                        if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size && board[newRow][newCol] == null) {
                            aiFrontier += 1;
                            break;
                        }
                    }
                } else if (board[i][j] == opponent) {
                    score -= positionalWeight[i][j];
                    for (let [x, y] of game.DIRECTIONS) {
                        let newRow = i + x, newCol = j + y;
                        if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size && board[newRow][newCol] == null) {
                            opponentFrontier += 1;
                            break;
                        }
                    }
                }
            }
        }

        const aiMobility = this.getValidMoves(player, board).length;
        const opponentMobility = this.getValidMoves(opponent, board).length;
        
        const mobilityWeight = 2;
        // maximise interior, minimise exterior pieces
        const frontierWeight = -1;

        score += mobilityWeight * (aiMobility - opponentMobility);
        score += frontierWeight * (aiFrontier - opponentFrontier);
        return score;
    }
  
    /*
    Ai is the maximising player, user is the minimising player
    */
    minimax(board, depth, alpha, beta, maximisingPlayer) {
        // Terminal when board state is an endgame
        if (depth == 0 || this.isTerminal(maximisingPlayer, board)) {
            return {score: this.getBoardScore(board), board: board};
        }

        let moves = this.getValidMoves(maximisingPlayer, board);
        if (moves.length == 0) {
            // Switch to other player
            return this.minimax(board, depth - 1, alpha, beta, this.getOpponent(maximisingPlayer));
        }

        if (maximisingPlayer == 'White') {
            let maxValue = {score: -Infinity, board: null};
            for (let move of moves) {
                let newBoard = this.getChildBoard('hardAI', move[0], move[1], maximisingPlayer, board);
                let bestObj = this.minimax(newBoard, depth - 1, alpha, beta, this.getOpponent(maximisingPlayer));
                if (bestObj.score > maxValue.score) {
                    maxValue = {score: bestObj.score, board: newBoard}
                }
                if (maxValue.score > beta) {
                    break;
                }
                alpha = Math.max(maxValue.score, alpha)
            }
            return maxValue;
        } else {
            let minValue = {score: Infinity, board: null};
            for (let move of moves) {
                let newBoard = this.getChildBoard('hardAI', move[0], move[1], maximisingPlayer, board);
                let bestObj = this.minimax(newBoard, depth - 1, alpha, beta, this.getOpponent(maximisingPlayer));
                if (bestObj.score < minValue.score) {
                    minValue = {score: bestObj.score, board: newBoard}
                }
                if (minValue.score < alpha) {
                    break;
                }
                beta = Math.min(beta, minValue.score)
            }
            return minValue;
        }
    }

    makeBestAiMove(status, board, maximisingPlayer, depth) {
        let validMoves = this.getValidMoves(maximisingPlayer, board);
        let cornerIndexes = [[0,0], [0, this.size - 1], [this.size - 1, 0], [this.size - 1], [this.size - 1]];
        let cornerMove = cornerIndexes.find(corner => 
            validMoves.some(move => move[0] === corner[0] && move[1] === corner[1]));
        if (cornerMove == undefined) {
            let bestObj = this.minimax(board, depth, -Infinity, Infinity, maximisingPlayer);
            this.board = bestObj.board;
            this.currentPlayer = this.getOpponent(maximisingPlayer);
        } else {
            this.makeMove(status, cornerMove[0], cornerMove[1], maximisingPlayer, board);
        }
    }

    /*
    Get number of pieces flipped
    */
    getFlippedPiecesNumber(row, col, board, player) {
        let flippedBoard = DeepCopy(board);
        let flippedPieces = 0;
        for (let [x, y] of game.DIRECTIONS) {
            flippedPieces += this.flipPieces(row, col, x, y, player, flippedBoard);
        }
        return flippedPieces;
    }

    /*
    Pick best move for reverse mode
    */
    makeBestReverseMove(board, player) {
        // Prioritise interior moves first, followed by edges, then corners
        let validMoves = this.getValidMoves(player, board);
        let cornerIndexes = [[0,0], [0, this.size - 1], [this.size - 1, 0], [this.size - 1, this.size - 1]];
        let edgeIndexes = [];
        let finalMove;
        let flippedMin = Infinity;

        // get edgesIndexes
        for (let row = 0; row < this.size; row++) {
            if (row == 0 || row == this.size - 1) {
                for (let col = 1; col < this.size - 1; col++) {
                    edgeIndexes.push([row, col]);
                }
            } else {
                edgeIndexes.push([row, 0]);
                edgeIndexes.push([row, this.size - 1]);
            }
        }

        // check if there are interior moves
        let interiorMoves = validMoves.filter(validMove => !cornerIndexes.some(move => 
            validMove[0] == move[0] && validMove[1] == move[1]) && !edgeIndexes.some(move => 
                validMove[0] == move[0] && validMove[1] == move[1]
            ));

        // No interior moves
        if (interiorMoves.length == 0) {
            let edgeMoves = validMoves.filter(validMove => edgeIndexes.some(move => validMove[0] == move[0] && validMove[1] == move[1]));
            // no edge moves
            if (edgeMoves.length == 0) {
                let cornerMoves = validMoves.filter(validMove => cornerIndexes.some(move => validMove[0] == move[0] && validMove[1] == move[1]));
                for (let i = 0; i < cornerMoves.length; i++) {
                    let move = cornerMoves[i];
                    let flippedNumber = this.getFlippedPiecesNumber(move[0], move[1], board, "White");
                    if (flippedNumber < flippedMin) {
                        flippedMin = flippedNumber;
                        finalMove = move;
                    }
                }
            } else {
                for (let i = 0; i < edgeMoves.length; i++) {
                    let move = edgeMoves[i];
                    let flippedNumber = this.getFlippedPiecesNumber(move[0], move[1], board, "White");
                    if (flippedNumber < flippedMin) {
                        flippedMin = flippedNumber;
                        finalMove = move;
                    }
                }
            }
        } else {
            for (let i = 0; i < interiorMoves.length; i++) {
                let move = interiorMoves[i];
                let flippedNumber = this.getFlippedPiecesNumber(move[0], move[1], board, "White");
                if (flippedNumber < flippedMin) {
                    flippedMin = flippedNumber;
                    finalMove = move;
                }
            }
        }
        this.makeMove("hardAI", finalMove[0], finalMove[1], "White", board);
    }
}

export default game;