import game from './game-logic';

describe('reversi logic tests', () => {
    let gameInstance;

    beforeEach(() => {
        gameInstance = new game(8, 'standard');  // Initialize a new game instance before each test
    });

    test('Initialise Board sets up board correctly', () => {
        const expectedBoard = [
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, "Black", "White", null, null, null],
            [null, null, null, "White", "Black", null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null]
        ];
        expect(gameInstance.board).toEqual(expectedBoard);
    });

    test('getRandomInt should return a number between 0 and max', () => {
        const max = 8;
        const randomInt = gameInstance.getRandomInt(max);
        expect(randomInt).toBeGreaterThanOrEqual(0);
        expect(randomInt).toBeLessThan(max);
    });

    test('getValidMoves gets all valid moves', () => {
        const board = [
            ["White", "White", "White", "White", "White", "White", "White", "White"],
            ["Black", "Black", "Black", "Black", "White", "White", "Black", null],
            ["Black", "Black", "Black", "White", "Black", "White", "Black", null],
            ["Black", "Black", "Black", "Black", "White", "White", "Black", null],
            ["Black", "Black", "White", "Black", "Black", "White", null, null],
            ["Black", "Black", "Black", "White", "Black", "White", null, null],
            [null, null, null, "Black", "White", "White", "White", null],
            [null, null, null, null, null, null, "Black", null]
        ];
        const validMoves = gameInstance.getValidMoves('Black', board);
        expect(new Set(validMoves)).toEqual(new Set([[4,6], [5,6], [6, 2], [6,7], [7,4], [7,5], [7,7]]))
    });

    test('Initial board setup for random mode', () => {
        let gameInstance = new game(8, 'random');
        let blackCount = 0;
        let whiteCount = 0;
        gameInstance.board.forEach(row => {
          row.forEach(cell => {
            if (cell === 'Black') blackCount++;
            if (cell === 'White') whiteCount++;
          });
        });
        expect(blackCount).toBe(2);
        expect(whiteCount).toBe(2);
      });
    
      test('Get opponent', () => {
        let gameInstance = new game(8, 'standard')
        expect(gameInstance.getOpponent('Black')).toBe('White');
        expect(gameInstance.getOpponent('White')).toBe('Black');
      });
    
      test('Check valid moves', () => {
        let gameInstance = new game(8, 'standard')
        const validMoves = gameInstance.getValidMoves('Black', gameInstance.board);
        expect(validMoves).toEqual(expect.arrayContaining([[2, 4], [3, 5], [4, 2], [5, 3]]));
      });
    
      test('Flip pieces', () => {
        let gameInstance = new game(8, 'standard')
        gameInstance.board[2][4] = 'Black';
        gameInstance.flipPieces(2, 4, 1, 0, 'Black', gameInstance.board);
        expect(gameInstance.board[3][4]).toBe('Black');
      });
    
      test('Make a move', () => {
        let gameInstance = new game(8, 'standard')
        gameInstance.makeMove('standard', 2, 4, 'Black', gameInstance.board);
        expect(gameInstance.board[2][4]).toBe('Black');
        expect(gameInstance.board[3][4]).toBe('Black');
      });

      test('Block cell', () => {
        let gameInstance = new game(8, 'standard')
        gameInstance.blockCell(2, 3, gameInstance.board);
        expect(gameInstance.board[2][3]).toBe('Blocked');
      });
});

describe('Game status tests', () => {
    test('Check game status', () => {
        let gameInstance = new game(8, 'standard')
        const status = gameInstance.checkGameStatus();
        expect(status.status).toBe('continue');
      });

      test('Skip turn', () => {
        const initialBoard = [
        [null, null, "White", "Black", "Black", "Black"],
        [null, null, "White", "Black", "Black", "Black"],
        [null, null, "White", "Black", "Black", "Black"],
        [null, null, "White", "White", "Black", "Black"],
        [null, null, "White", "White", "White", "Black"],
        [null, null, "White", "White", "White", "White"]
        ];
        const gameInstance = new game(6, 'standard');
        gameInstance.board = initialBoard;
        gameInstance.currentPlayer = 'Black';
        gameInstance.makeMove('standard', 0, 1, 'Black', gameInstance.board);
        expect(gameInstance.board[0][2]).toBe('Black');
        expect(gameInstance.board[1][2]).toBe('Black');
        const result = gameInstance.checkGameStatus();
        expect(gameInstance.currentPlayer).toBe('Black');
        expect(result.message).toBe('Player 2 has no valid moves. Turn skipped.');
      });
    
      test('End in draw', () => {
        const initialBoard = [
        ["Black", "Black", "Black", "Black", "Black", null, "Black", "White"],
        ["Black", "White", "Black", "Black", "Black", "Black", "Black", "White"],
        ["Black", "White", "White", "Black", "Black", "White", "Black", "White"],
        ["Black", "White", "Black", "White", "White", "Black", "White", "White"],
        ["Black", "Black", "Black", "White", "White", "Black", "White", "White"],
        ["Black", "Black", "Black", "White", "Black", "White", "Black", "White"],
        ["Black", "Black", "Black", "Black", "Black", "Black", "White", "White"],
        ["Black", "White", "White", "White", "White", "White", "White", "White"]
        ];
        const gameInstance = new game(8, 'standard');
        gameInstance.board = initialBoard;
        gameInstance.currentPlayer = 'White';
        gameInstance.makeMove('standard', 0, 5, 'White', gameInstance.board);
        const result = gameInstance.checkGameStatus();
        expect(result.status).toBe('draw');
      });
    
      test('End in win', () => {
        const initialBoard = [
        ["Black", "Black", "Black", "Black", "White", null, "Black", "White"],
        ["Black", "White", "White", "White", "Black", "Black", "Black", "White"],
        ["Black", "White", "White", "Black", "Black", "White", "Black", "White"],
        ["Black", "White", "Black", "White", "White", "Black", "White", "White"],
        ["Black", "Black", "Black", "White", "White", "Black", "White", "White"],
        ["Black", "Black", "Black", "White", "Black", "White", "Black", "White"],
        ["Black", "Black", "Black", "Black", "Black", "Black", "White", "White"],
        ["Black", "White", "White", "White", "White", "White", "White", "White"]
        ];
        const gameInstance = new game(8, 'standard');
        gameInstance.board = initialBoard;
        gameInstance.currentPlayer = 'White';
        gameInstance.makeMove('standard', 0, 5, 'White', gameInstance.board);
        const result = gameInstance.checkGameStatus();
        expect(result.status).toBe('win');
        expect(result.winner).toBe('White');
      });
});

describe('AI opponent tests', () => {
    test('Check if board is terminal', () => {
        let gameInstance = new game(8, 'standard')
        expect(gameInstance.isTerminal('Black', gameInstance.board)).toBe(false);
        let endBoard = [
            ["Black", "Black", "Black", "Black", "Black", "White"],
            ["White", "Black", "Black", "Black", "Black", "White"],
            ["White", "Black", "Black", "Black", "Black", "White"],
            ["White", "Black", "White", "White", "Black", "White"],
            ["White", "White", "Black", "Black", "White", "White"],
            ["White", "White", "White", "White", "White", "White"]
        ]
        expect(gameInstance.isTerminal("Black", endBoard)).toEqual(true);
      });
    
      test('Calculate board score', () => {
        let gameInstance = new game(6, 'standard')
        let newBoard = [
            [null, null, null, null, null, null],
            ["White", "White", "White", "White", "White", null],
            [null, null, "Black", "Black", "Black", null],
            [null, "Black", "Black", "Black", null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null]
        ]
        const score = gameInstance.getBoardScore('standard', newBoard, 'Black', false);
        expect(score).toEqual(-113);
      });
    
      test('Check if hard AI chooses corner for standard reversi', () => {
        let gameInstance = new game(6, 'standard');
        let newBoard = [
            [null, "Black", null, null, "White", "Black"],
            [null, "Black", "Black", "White", "White", null],
            ["White", "White", "White", "Black", "White", null],
            [null, "White", "White", "Black", "Black", "White"],
            [null, null, "White", "White", "Black", "Black"],
            [null, null, "White", "White", "White", "Black"]
        ]
        gameInstance.board = newBoard
        gameInstance.makeBestAiMove('hardAI', 'standard', newBoard, "White", 3, false);
        expect(gameInstance.board[0][0]).toBe("White")
      });
    
      test('Check if hard AI chooses best move for standard reversi', () => {
        let gameInstance = new game(6, 'standard');
        let newBoard = [
            [null, null, null, null, null, null],
            [null, null, null, "Black", null, null],
            [null, null, "Black", "Black", null, null],
            [null, null, "White", "Black", null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null]
        ]
        gameInstance.board = newBoard;
        gameInstance.makeBestAiMove('hardAI', 'standard', newBoard, "White", 3, false);
        expect(gameInstance.board[3][3]).toBe("White");
        expect(gameInstance.board[3][4]).toBe("White");
      });

      test('Check if hard AI chooses corner to block for obstruction reversi', () => {
        let gameInstance = new game(6, 'block');
        let newBoard = [
            [null, null, null, null, null, null],
            [null, null, "White", "Black", null, null],
            [null, "Black", "Black", "White", null, null],
            [null, null, "White", "Black", "White", null],
            [null, null, null, null, "White", null],
            [null, null, null, null, "White", null]
        ]
        gameInstance.board = newBoard;
        gameInstance.makeBestAiMove('hardAI', 'block', newBoard, "Black", 3, true);
        expect(gameInstance.board[5][5]).toBe("Blocked");
      });

      test('Check if hard AI chooses best place to block for obstruction reversi', () => {
        let gameInstance = new game(6, 'block');
        let newBoard = [
            [null, null, null, null, null, null],
            [null, null, "White", "Black", null, null],
            [null, null, "White", "Black", null, null],
            [null, null, "White", "Black", null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null]
        ]
        gameInstance.board = newBoard;
        gameInstance.makeBestAiMove('hardAI', 'block', newBoard, "Black", 3, true);
        expect(gameInstance.board[2][1]).toBe("Blocked");
      });

      test('Check if hard AI chooses best place for reverse reversi', () => {
        let gameInstance = new game(6, 'reverse');
        let newBoard = [
            [null, "White", "White", "White", null, null],
            ["Black", "White", "White", "White", "White", "White"],
            ["Black", "Black", "Black", "Black", "White", "Black"],
            ["Black", "Black", "Black", "White", "Black", "Black"],
            ["Black", "Black", "Black", "Black", "White", null],
            [null, "White", "Black", null, "White", null]
        ]
        gameInstance.board = newBoard;
        gameInstance.makeBestReverseMove(newBoard, "White");
        expect(gameInstance.board[5][3]).toBe("White");
        expect(gameInstance.board[5][2]).toBe("White");
        expect(gameInstance.board[4][3]).toBe("White");
      });

});