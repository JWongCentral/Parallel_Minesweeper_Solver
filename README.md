# Parallel_Minesweeper_Solver

The basic program/script with a bit of HTML/web for the front end to interact/get game states so we can run the minesweeper script. 
The primary function of the script is to calculate ALL possibilities of a bomb
and returning the best result to perform an action before it recalculates again.
This was parallelized using openMP to utilize the shared memory parallelization paradigm to increase efficiency.
