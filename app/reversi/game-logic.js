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
}