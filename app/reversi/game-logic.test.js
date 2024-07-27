import game from './game-logic';

test('Initialise Board sets up board correctly', () => {
    let gameInstance = new game(8, 'standard');
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
    gameInstance.board[2][3] = 'Black';
    gameInstance.flipPieces(2, 3, 1, 0, 'Black', gameInstance.board);
    expect(gameInstance.board[3][3]).toBe('Black');
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
  });

  test('Calculate board score', () => {
    let gameInstance = new game(8, 'standard')
    const score = gameInstance.getBoardScore('standard', gameInstance.board, 'Black', false);
    expect(score).toBeDefined();
  });
