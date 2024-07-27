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


