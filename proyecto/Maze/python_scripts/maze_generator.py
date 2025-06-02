import json
import random

def create_maze(width: int, height: int) -> list[list[int]]:
    """
    Generates a maze using the DFS algorithm with backtracking.

    Args:
        width: The width of the maze (must be odd).
        height: The height of the maze (must be odd).

    Returns:
        A 2D list representing the maze, where 0 is a path and 1 is a wall.
    """
    if width % 2 == 0 or height % 2 == 0:
        raise ValueError("Width and height must be odd numbers.")

    # Initialize maze with all walls
    maze = [[1 for _ in range(width)] for _ in range(height)]

    # Stack for DFS
    stack = []

    # Starting point (must be an odd coordinate)
    start_x, start_y = (1, 1)
    maze[start_y][start_x] = 0
    stack.append((start_x, start_y))

    while stack:
        x, y = stack[-1]

        # Find unvisited neighbors
        neighbors = []
        # Check North
        if y - 2 >= 0 and maze[y - 2][x] == 1:
            neighbors.append(('N', x, y - 2))
        # Check South
        if y + 2 < height and maze[y + 2][x] == 1:
            neighbors.append(('S', x, y + 2))
        # Check East
        if x + 2 < width and maze[y][x + 2] == 1:
            neighbors.append(('E', x + 2, y))
        # Check West
        if x - 2 >= 0 and maze[y][x - 2] == 1:
            neighbors.append(('W', x - 2, y))

        if neighbors:
            direction, next_x, next_y = random.choice(neighbors)

            # Carve path to the neighbor
            if direction == 'N':
                maze[y - 1][x] = 0
            elif direction == 'S':
                maze[y + 1][x] = 0
            elif direction == 'E':
                maze[y][x + 1] = 0
            elif direction == 'W':
                maze[y][x - 1] = 0
            
            maze[next_y][next_x] = 0
            stack.append((next_x, next_y))
        else:
            # Backtrack
            stack.pop()

    # Create an exit
    # Ensure the exit is on a path cell, and connected
    # A simple way: pick a location like bottom-right, but ensure it's an odd index for consistency with paths
    exit_y = height - 2 # Second to last row (path part)
    exit_x = width - 2  # Second to last col (path part)

    # Ensure maze[exit_y][exit_x] is a path. If it was a wall, carve it.
    maze[exit_y][exit_x] = 0 

    # Also make sure the cell next to it towards the border is open if it leads to outside
    # For an exit at (width-2, height-2), we can open (width-1, height-2) or (width-2, height-1)
    # Let's open towards the right edge for simplicity, if it's a border wall
    if exit_x == width - 2 and width -1 < width : # If exit_x is the last path cell column
        maze[exit_y][width - 1] = 0 # Open the border wall cell to its right
    elif exit_y == height - 2 and height -1 < height: # If exit_y is the last path cell row (alternative exit)
         maze[height-1][exit_x] = 0 # Open the border wall cell below it

    return maze

def save_maze_to_json(maze: list[list[int]], filename: str = "maze.json") -> None:
    """
    Saves the generated maze to a JSON file.

    Args:
        maze: The 2D list representing the maze.
        filename: The name of the JSON file to save the maze to.
                  It will be saved in the `public` directory relative to this script's parent.
    """
    # Assume this script is in python_scripts, and we want to save to ../public/
    # This path might need adjustment based on final project structure
    import os
    script_dir = os.path.dirname(__file__) # Gets directory of the script
    project_root = os.path.dirname(script_dir) # Up one level to Maze
    public_dir = os.path.join(project_root, 'public')
    
    if not os.path.exists(public_dir):
        os.makedirs(public_dir)
        
    filepath = os.path.join(public_dir, filename)
    
    with open(filepath, 'w') as f:
        json.dump(maze, f)
    print(f"Maze saved to {filepath}")

if __name__ == "__main__":
    maze_width = 21  # Must be odd
    maze_height = 21 # Must be odd
    
    generated_maze = create_maze(maze_width, maze_height)
    
    # Optional: Print maze to console for a quick check
    # for row in generated_maze:
    #     print("".join(["#" if cell == 1 else " " for cell in row]))
        
    save_maze_to_json(generated_maze) 