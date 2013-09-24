var BOARD_SIZE = 4;
var moves = [];

function setup_board()
{
    var board = document.getElementById('sudoku_board');
    for (var i = 0 ; i < BOARD_SIZE; i++)
    {
        for (var j = 0; j < BOARD_SIZE; j++)
        {
            var cell = board.rows[i].cells[j];
            var num = initBoard[i][j];

            if (num != 0)
            {
                cell.innerHTML = num;
                cell.setAttribute("class", "assigned");    
            }
            else
            {
                populate_unassigned_cell(cell, i, j, [1,2,3,4]);
            }
        }
    }

    document.getElementById("hints").checked = false;

    add_hints();
}

function select_number(row, col, num)
{
    var cell = document.getElementById('sudoku_board').rows[row].cells[col];
    cell.innerHTML = num;
    moves.push(new Move(row, col, num));
    cell.setAttribute("class", "assigned");
    if (check_for_done())
    {
        if (check_for_win())
        {
            win();
        }
        else
        {
            lose();
        }
    }
    add_hints();
    return false;
}

function check_for_done()
{
    var board = document.getElementById('sudoku_board');
    for (var i = 0 ; i < BOARD_SIZE; i++)
    {
        for (var j = 0; j < BOARD_SIZE; j++)
        {
            var cell = board.rows[i].cells[j];
            if (cell.getAttribute("class") == "unassigned")
            {
                return false;
            }

        }
    }
    return true;
}

function check_for_win()
{
    // We have already checked that all cells are assigned
    // First check rows
    if (!check_rows_and_cols() || !check_blocks())
    {
        return false;
    }
    return true;
}

function check_rows_and_cols()
{    
    var board = document.getElementById('sudoku_board');
    for (var i = 0; i < BOARD_SIZE; i++)
    {
        // Create count of numbers for this row
        var rowNumberCount = [false, false, false, false];
        var colNumberCount = [false, false, false, false];

        // Go through row marking off every unique number we see
        for (var j = 0; j < BOARD_SIZE; j++)
        {
            var rowCell = board.rows[i].cells[j];
            var colCell = board.rows[j].cells[i];
            rowNumberCount[rowCell.innerHTML - 1] = true;
            colNumberCount[colCell.innerHTML - 1] = true;
        }

        // Go through row count and if we find a false (number wasn't found), return not won
        for (var w = 0; w < rowNumberCount.length; w++)
        {
            if (!rowNumberCount[w])
            {
                return false;
            }

            if (!colNumberCount[w])
            {
                return false;
            }
        }
    }

    return true;
}

function check_blocks()
{
    var board = document.getElementById('sudoku_board');

    for (var rowBase = 0; rowBase < BOARD_SIZE; rowBase += 2)
    {
        for (var colBase = 0; colBase < BOARD_SIZE; colBase += 2)
        {
            var blockNumberCount = [false, false, false, false];
            
            for (var rowDiff = 0; rowDiff < 2; rowDiff++)
            {
                for (var colDiff = 0; colDiff < 2; colDiff++)
                {
                    var blockCell = board.rows[rowBase+rowDiff].cells[colBase + colDiff];
                    blockNumberCount[blockCell.innerHTML - 1] = true;
                }
            }

            // Go through number count and if we find a false (number wasn't found), return not won
            for (var w = 0; w < blockNumberCount.length; w++)
            {
                if (!blockNumberCount[w])
                {
                    return false;
                }
            }
        }
    }

    return true;
}

function win()
{
    alert("You won the game!");
    setup_board();
}

function lose()
{
    alert("The board you have entered is not correct.");
}

function populate_unassigned_cell(cell, row, col, numbersToDisplay)
{
    var linkStr = "";
    for (var w = 0; w < BOARD_SIZE; w++)
    {
        if (numbersToDisplay[w] == 0)
        {
            linkStr += "<a href=\"javascript:void(0)\" class=\"linkedNumbers\">&nbsp&nbsp</a>";
        }
        else
        {
            linkStr += "<a href=\"javascript:void(0)\" class=\"linkedNumbers\" onclick=\"select_number(" + row + "," + col + "," + (w+1) + ")\">" + numbersToDisplay[w] + "</a> ";
        }

        if (w == 1)
        {
            linkStr += "<br>";
        }
    }
    cell.setAttribute("class", "unassigned");
    cell.innerHTML = linkStr;
}

function undo()
{
    if (moves.length > 0)
    {
        var lastMove = moves.pop();
        var row = lastMove.row;
        var col = lastMove.col;
        var cell = document.getElementById('sudoku_board').rows[row].cells[col];
        populate_unassigned_cell(cell, row, col, [1,2,3,4]);
        add_hints();
    }
}

function add_hints()
{
    var hintBoard = createHintBoard();

    if (document.getElementById("hints").checked)
    {
        var board = document.getElementById('sudoku_board');
        
        // Find column and row hints
        for (var i = 0; i < BOARD_SIZE; i++)
        {
            for (var j = 0; j < BOARD_SIZE; j++)
            {
                var curCell = board.rows[i].cells[j];

                // If cell is assigned then get the number it holds
                if (curCell.getAttribute("class") == "assigned")
                {
                    var foundNum = curCell.innerHTML;
                    
                    // For every cell in that row, remove foundNum
                    var hintRow = hintBoard[i];
                    for (var col = 0; col < BOARD_SIZE; col++)
                    {
                        hintRow[col].removeMove(foundNum);
                    }

                    // For every cell in that column, remove foundNum
                    var hintCol = [hintBoard[0][j], hintBoard[1][j], hintBoard[2][j], hintBoard[3][j]];

                    for (var row = 0; row < BOARD_SIZE; row++)
                    {
                        hintCol[row].removeMove(foundNum);
                    }
                }
            }
        }

        // Get hints from blocks
        for (var rowBase = 0; rowBase < BOARD_SIZE; rowBase += 2)
        {
            for (var colBase = 0; colBase < BOARD_SIZE; colBase += 2)
            {   
                var curBlock = new Array();
                for (var rowDiff = 0; rowDiff < 2; rowDiff++)
                {
                    for (var colDiff = 0; colDiff < 2; colDiff++)
                    {
                        var blockCell = hintBoard[(rowBase+rowDiff)][(colBase+colDiff)];
                        curBlock.push(blockCell);
                    }
                }

                // Find assigned numbers and remove them from the block
                for (var rowDiff = 0; rowDiff < 2; rowDiff++)
                {
                    for (var colDiff = 0; colDiff < 2; colDiff++)
                    {
                        var blockCell = board.rows[rowBase+rowDiff].cells[colBase + colDiff];

                        if (blockCell.getAttribute("class") == "assigned")
                        {
                            var foundNum = blockCell.innerHTML;

                            // Remove number from all the cells in that block
                            for (var cellNum = 0; cellNum < BOARD_SIZE; cellNum++)
                            {
                                curBlock[cellNum].removeMove(foundNum);
                            } 
                        }
                    }
                }
            }
        }

        // Print new board
        printBoard(hintBoard);
    }
    else
    {
        var board = document.getElementById("sudoku_board");
        for (var i = 0; i < BOARD_SIZE; i++)
        {
            for (var j = 0; j < BOARD_SIZE; j++)
            {
                var cell = board.rows[i].cells[j];

                if (cell.getAttribute("class") != "assigned")
                {
                    populate_unassigned_cell(cell, i, j, [1,2,3,4]);
                }
            }
        }
    }

}

function createHintBoard()
{
    var hintBoard = new Array(new Array(4),
                          new Array(4),
                          new Array(4),
                          new Array(4));

    for (var i = 0; i < BOARD_SIZE; i++)
    {
        for (var j = 0; j < BOARD_SIZE; j++)
        {
            hintBoard[i][j] = new Cell(i, j);
        }
    }

    return hintBoard;
}

function printBoard(hintBoard)
{
    var board = document.getElementById('sudoku_board');
    for (var i = 0 ; i < BOARD_SIZE; i++)
    {
        for (var j = 0; j < BOARD_SIZE; j++)
        {
            var cell = board.rows[i].cells[j];

            if (cell.getAttribute("class") != "assigned")
            {
                populate_unassigned_cell(cell, i, j, hintBoard[i][j].possibleMoves);
            }
        }
    }
}

// A player "move" object stored for later 
function Move(row, col, num)
{
    this.row = row;
    this.col = col;
    this.num = num;
}

function Cell(row, col)
{
    this.row = row;
    this.col = col;
    this.possibleMoves = [1,2,3,4];

    Cell.prototype.removeMove = function(num)
    {
        this.possibleMoves[num-1] = 0;
    };
}
