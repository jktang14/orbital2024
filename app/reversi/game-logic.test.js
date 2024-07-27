import game from './game-logic';

describe('game class tests', () => {
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

  test('Check game status', () => {
    let gameInstance = new game(8, 'standard')
    const status = gameInstance.checkGameStatus();
    expect(status.status).toBe('continue');
  });

  test('Block cell', () => {
    let gameInstance = new game(8, 'standard')
    gameInstance.blockCell(2, 3, gameInstance.board);
    expect(gameInstance.board[2][3]).toBe('Blocked');
  });

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
