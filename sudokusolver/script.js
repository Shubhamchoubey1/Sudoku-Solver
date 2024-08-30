// Function to dynamically create the Sudoku grid on page load
function createSudokuGrid() {
    const sudokuGrid = document.getElementById('sudokuGrid'); // Get the container element for the Sudoku grid
    for (let i = 0; i < 9; i++) { // Loop through each row
        for (let j = 0; j < 9; j++) { // Loop through each column
            const input = document.createElement('input'); // Create a new input element for each cell
            input.type = 'text'; // Set the input type to text
            input.id = `${i * 9 + j}`; // Assign a unique ID based on row and column indices
            input.className = 'box'; // Add a class name to style the input
            input.maxLength = 1; // Set the maximum length of input to 1 character (single digit)

            // Event listener to highlight the row, column, and 3x3 grid
            input.addEventListener('focus', () => highlightCells(i, j));
            input.addEventListener('blur', clearHighlights);

            // Input validation
            input.oninput = (e) => {
                const value = e.target.value;
                if (!/^[1-9]$/.test(value)) { // Validate if the input is a number between 1 and 9
                    e.target.value = ''; // Clear the input if it's not a valid number
                    e.target.style.backgroundColor = 'lightblue'; // Reset background color if input is cleared
                } else {
                    validateInput(value, i, j); // Validate the input against the solved Sudoku board
                }
            };
            sudokuGrid.appendChild(input); // Append the input element to the Sudoku grid container
        }
    }
}
    


// Function to highlight the relevant cells
function highlightCells(row, col) {
    // Highlight the entire row
    for (let j = 0; j < 9; j++) {
        arr[row][j].style.backgroundColor = 'lightblue';
    }

    // Highlight the entire column
    for (let i = 0; i < 9; i++) {
        arr[i][col].style.backgroundColor = 'lightblue';
    }

    // Highlight the 3x3 sub-grid
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            arr[i][j].style.backgroundColor = 'lightblue';
        }
    }
}

// Function to clear the highlights
function clearHighlights() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (arr[i][j].style.backgroundColor == 'lightblue') {
                arr[i][j].style.backgroundColor = ''; // Clear the background color
            }
        }
    }
}

// Call the function to create the Sudoku grid when the page loads
createSudokuGrid();

// Array to store references to each input element in the Sudoku grid
var arr = [[], [], [], [], [], [], [], [], []];

// Populate the arr array with references to each input element based on their IDs
for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
        arr[i][j] = document.getElementById(i * 9 + j);
    }
}

// 2D array to represent the Sudoku board
var board = [[], [], [], [], [], [], [], [], []];
// 2D array to represent the solved Sudoku board
var solvedBoard = [[], [], [], [], [], [], [], [], []];
let numberCounts = new Array(10).fill(9); // Initialize counts for numbers 1-9

// Function to fill the Sudoku grid with numbers from the board array
function FillBoard(board) {
    for (var i = 0; i < 9; i++) { // Loop through each row
        for (var j = 0; j < 9; j++) { // Loop through each column
            if (board[i][j] != 0) { // Check if the cell is not empty (has a number)
                arr[i][j].value = board[i][j]; // Set the input value to the number from the board
                arr[i][j].disabled = true; // Disable the input to prevent user modification
                arr[i][j].classList.add('prefilled'); // Add prefilled class for styling
            } else {
                arr[i][j].value = ''; // Clear the input if the cell is empty
                arr[i][j].disabled = false; // Enable the input for user input
                arr[i][j].classList.remove('prefilled'); // Remove prefilled class
            }
        }
    }
}

// Event handler for the 'Get Puzzle' button click
document.getElementById('GetPuzzle').onclick = function () {
    wrongAttempts = 0;
    stopTimer();
    const difficulty = document.getElementById('difficulty').value; // Get the selected difficulty level from dropdown

    // Function to fetch a Sudoku puzzle from an API based on difficulty
    function fetchPuzzle(difficulty) {
        return fetch(`https://sugoku.onrender.com/board?difficulty=${difficulty}`)
            .then(response => {
                if (!response.ok) { // Check if the response status is not OK (HTTP status code other than 200)
                    throw new Error('Network response was not ok'); // Throw an error if the response is not OK
                }
                return response.json(); // Parse the JSON response and return it as a promise
            });
    }

    // Call the fetchPuzzle function with the selected difficulty level
    fetchPuzzle(difficulty)
        .then(response => {
            board = response.board; // Assign the fetched Sudoku board to the global 'board' variable

            // Clone the fetched board and solve it
            const boardCopy = board.map(row => row.slice());
            SudokuSolver(boardCopy, 0, 0, 9);
            solvedBoard = boardCopy;
            console.log(solvedBoard);

            FillBoard(board); // Fill the Sudoku grid with numbers from the fetched board
            startTimer(); // Start the timer when the puzzle is fetched

            // Initialize the number counts
            numberCounts.fill(9);
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (board[i][j] !== 0) {
                        numberCounts[board[i][j]]--;
                    }
                }
            }
            updateNumberCounts();
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error); // Log an error message if fetching fails
        });
};
// Counter for wrong attempts made by the user
let wrongAttempts = 0;
const maxWrongAttempts = 3; // Maximum allowed wrong attempts before game over

// Timer variables
let timerInterval;
let startTime;
let elapsedPausedTime = 0;
let pausedTime = 0;
let isPaused = false;

// Function to start the timer
function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000); // Update the timer every second
}

// Function to update the timer display
function updateTimer() {
    if (!isPaused) {
        let currentTime = new Date();
        let elapsedTime = currentTime.getTime() - startTime.getTime() - elapsedPausedTime;
        let hours = Math.floor(elapsedTime / (1000 * 60 * 60)).toString().padStart(2, '0');
        let minutes = (Math.floor(elapsedTime / (1000 * 60)) % 60).toString().padStart(2, '0');
        let seconds = (Math.floor(elapsedTime / 1000) % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `${hours}:${minutes}:${seconds}`;
    }
}

// Function to stop the timer
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = 0;
    startTime = 0;
    elapsedPausedTime = 0;
    pausedTime = 0;
    isPaused = false;
}

// Function to pause the timer
function pauseTimer() {
    if (!isPaused) {
        pausedTime = new Date();
        isPaused = true;
    }
}

// Function to resume the timer
function resumeTimer() {
    if (isPaused) {
        const currentTime = new Date();
        elapsedPausedTime += currentTime.getTime() - pausedTime.getTime();
        isPaused = false;
    }
}

// Event handlers for pause and resume buttons
document.getElementById('PauseTimer').onclick = pauseTimer;
document.getElementById('ResumeTimer').onclick = resumeTimer;
// Function to update the count display
function updateCountDisplay(number, count) {
    const countElement = document.getElementById(`count-${number}`).querySelector('.count');
    countElement.textContent = 9 - count;
}

// Function to update the number counts

//Nice
function updateNumberCounts() {
    const counts = Array(9).fill(0); // Initialize an array to hold counts for each number 1-9

    for (let i = 0; i < 81; i++) { // Loop through all cells in the Sudoku grid
        const value = document.getElementById(i).value; // Get the value of the cell
        if (value >= '1' && value <= '9') { // Check if the value is a valid number between 1 and 9
            counts[parseInt(value) - 1]++; // Increment the count for the corresponding number
        }
    }

    for (let i = 0; i < 9; i++) { // Loop through each number 1-9
        updateCountDisplay(i + 1, counts[i]); // Update the count display for each number
    }
}
function isSudokuSolved() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (arr[i][j].value == "" || parseInt(arr[i][j].value) !== solvedBoard[i][j]) {
                return false; // Return false if any cell is empty or incorrect
            }
        }
    }
    return true; // Return true if all cells are correctly filled
}
// Modify validateInput to update the counts
function validateInput(value, row, col) {
    const num = parseInt(value); // Convert the input value to an integer
    let isValid = (solvedBoard[row][col] === num); // Check if the input matches the solved board

    // Update cell background color based on validity
    if (isValid) {
        arr[row][col].style.backgroundColor = ''; // Reset background color if valid
        arr[row][col].disabled = true;
        arr[row][col].classList.add('prefilled');

        // Decrement the count for the used number
        
        updateNumberCounts();

        // Check if the Sudoku is solved
        if (isSudokuSolved()) {
            alert('Congratulations! You have solved the Sudoku.');
            stopTimer(); // Stop the timer when the puzzle is solved
        }
    } else {
        arr[row][col].style.backgroundColor = 'red'; // Set background color to red if invalid
        incrementWrongAttempts(); // Increment wrong attempts counter
    }
}
// Function to increment and check wrong attempts
function incrementWrongAttempts() {
    wrongAttempts++;

    if (wrongAttempts >= maxWrongAttempts) { // Check if maximum wrong attempts reached
        alert('Game Over! Too many wrong attempts.'); // Show game over alert message
        document.querySelectorAll('.box').forEach(cell => cell.style.backgroundColor = '');
        document.querySelectorAll('.box').forEach(cell => cell.disabled = true); // Disable all input cells
        stopTimer(); // Stop the timer when the game is over
    }
}

// Function to solve the Sudoku board using backtracking
function SudokuSolver(board, i, j, n) {
    if (i == n) { // If all rows are processed (base case)
        return true; // Return true to indicate a solution is found
    }

    if (j == n) { // If all columns in the current row are processed
        return SudokuSolver(board, i + 1, 0, n); // Move to the next row
    }

    if (board[i][j] != 0) { // If the current cell is not empty
        return SudokuSolver(board, i, j + 1, n); // Move to the next column
    }

    // Try placing numbers 1 to 9 in the current cell
    for (let num = 1; num <= 9; num++) {
        if (check(board, i, j, num, n)) { // Check if 'num' can be placed at board[i][j]
            board[i][j] = num; // Place 'num' at board[i][j]

            if (SudokuSolver(board, i, j + 1, n)) { // Recursively solve the next column
                return true; // Return true if a solution is found
            }

            board[i][j] = 0; // Backtrack: Reset board[i][j] to 0 if no valid number found
        }
    }

    return false; // Return false if no number can be placed at board[i][j] (trigger backtracking)
}

// Function to check if placing 'num' at board[i][j] is valid
function check(board, i, j, num, n) {
    // Check if 'num' already exists in the same row or column
    for (let x = 0; x < n; x++) {
        if (board[i][x] == num || board[x][j] == num) {
            return false; // Return false if 'num' already exists in the same row or column
        }
    }

    // Calculate the size of each sub-grid
    let rn = Math.sqrt(n);
    let si = i - (i % rn); // Start row index of the sub-grid
    let sj = j - (j % rn); // Start column index of the sub-grid

    // Check if 'num' already exists in the 3x3 sub-grid
    for (let x = si; x < si + rn; x++) {
        for (let y = sj; y < sj + rn; y++) {
            if (board[x][y] === num) {
                return false; // Return false if 'num' already exists in the 3x3 sub-grid
            }
        }
    }

    return true; // Return true if placing 'num' at board[i][j] is valid
}

// Event handler for the 'Solve Puzzle' button click
document.getElementById('SolvePuzzle').onclick = () => {
    for(let i = 0;i<9;i++) {
        for(let j = 0;j<9;j++) {
            arr[i][j].style.backgroundColor = '';
        }
    }
    const boardCopy = board.map(row => row.slice());
    SudokuSolver(boardCopy, 0, 0, 9);
    FillBoard(boardCopy);
    stopTimer();
    alert('Sudoku solved by the solver.');
   updateNumberCounts();
};
