const IsEqual = (board1, board2) => {
    for (let i = 0; i < board1.length; i++) {
        for (let j = 0; j < board2.length; j++) {
            if (board1[i][j] != board2[i][j]) {
                return false;
            }
        }
    }
    return true;
}

export default IsEqual;