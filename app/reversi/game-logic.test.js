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