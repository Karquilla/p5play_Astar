// A* Algorithm Path Finding Example
// By: Kyle Arquilla
// November 3rd, 2024

function setup() {
  runState = "start";
  slctMode = "none";
  mousePOS = createVector(0, 0);
  selection = "";
  grid = [];
  allNodes = new Group();
  wallNodes = new Group();
  openNodes = new Group();
  checkedNodes = new Group();
  pathNodes = new Group();
  startNode = '';
  endNode = '';
  openSet = [];
  closedSet = [];
  rows = 30;  // Number of rows
  cols = 40;  // Number of columns
  cellSize = 20;  // Size of each cell
  createCanvas(cols * cellSize, rows * cellSize);
  setupGrid();
}

function setupGrid() {
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      let sprite = new allNodes.Sprite(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, cellSize, cellSize, 'k');
      sprite.color = "lightgrey";
      sprite.state = "open";
      sprite.fscore = 0;
      sprite.gscore = 0;
      sprite.hscore = 0;
      sprite.previous = null;
      sprite.gridPOS = createVector(x, y);
      sprite.location = createVector(x * cellSize, y * cellSize);
      row.push(sprite);
    }
    grid.push(row);
  }
}

function draw() {
  background(220);
  allNodes.color = "lightgrey";
  if (startNode) startNode.color = "green";
  if (endNode) endNode.color = "red";
  wallNodes.color = "black";
  checkedNodes.color = "purple";
  pathNodes.color = "grey";
  allNodes.draw()
  wallNodes.draw()
  checkedNodes.draw()
  pathNodes.draw()
  if (startNode) startNode.draw()
  if (endNode) endNode.draw()

  switch (runState) {
    case "start":
      runState = "selection";
      slctMode = "start";
      break;
    case "selection":
      mouseTrans();
      if (mouse.x >= 0 && mouse.x < cols * cellSize && mouse.y >= 0 && mouse.y < rows * cellSize) {
        switch (slctMode) {
          case "start":
            grid[mousePOS.y][mousePOS.x].color = "green";  // Access the sprite at the mouse position
            if (mouse.presses()) {
              startNode = grid[mousePOS.y][mousePOS.x];
              allNodes.remove(startNode);
              startNode.state = "start";
            }
            if (mouse.released()) {
              slctMode = "end";
            }
            break;
          case "end":
            grid[mousePOS.y][mousePOS.x].color = "red";  // Access the sprite at the mouse position
            if (mouse.presses()) {
              endNode = grid[mousePOS.y][mousePOS.x];
              allNodes.remove(endNode);
              endNode.state = "end";
            }
            if (mouse.released()) {
              slctMode = "wall";
            }
            break;
          case "wall":
            grid[mousePOS.y][mousePOS.x].color = "black";  // Access the sprite at the mouse position
            if (mouse.pressing()) {
              let wallNode = grid[mousePOS.y][mousePOS.x];
              wallNode.state = "wall";
              allNodes.remove(wallNode);
              wallNodes.push(wallNode);
            }
            if (kb.presses("e")) {
              slctMode = "done";
              runState = "run";
            }
            break;
        }
      }
      break;
    case "run":
      aStar();
      runState = "done";
      break;
    case "done":
      // Finished; path is complete or no solution
      break;
  }
}

// Visualize path
function aStar() {
  construct_path();
}

// Construct path for A* search
 async function construct_path() {
  construct_hScores();
  wallCount = 0;
  openSet.push(startNode);

  while (openSet.length > 0) { // Using p5.play's empty check for arrays

    // Find the next best spot
    let nextBest = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[nextBest].fscore > openSet[i].fscore) { // Fixed typo `nextbest` to `nextBest`
        nextBest = i;
      }
    }

    let currentNode = openSet[nextBest];
    let pathNodespre = []
    // Is this the end?
    if (currentNode.state == "end") {
      let current = endNode;
      while (current) {
        pathNodespre.unshift(current);
        current = current.previous;
      }

      for (let i = 0; i < pathNodespre.length; i++) {
        pathNodes.push(pathNodespre[i]); // Add each node in the final path to pathNodes
        await sleep(50);
      }
      break;
    }

    checkedNodes.push(currentNode)
    // Move best option from openSet to closedSet
    removeFromArray(openSet,currentNode); // p5.play's `remove` method to remove specific element
    closedSet.push(currentNode);

    // Check neighbors for possible nextBest
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        let newY = currentNode.gridPOS.y + y;
        let newX = currentNode.gridPOS.x + x;

        // Ensure neighbors are within bounds
        if (newY >= 0 && newY < grid.length && newX >= 0 && newX < grid[0].length) {
          let neighbor = grid[newY][newX];
          

          // Skip neighbor if in closedSet or is a wall
          if (closedSet.includes(neighbor) || neighbor.state === "wall") {
            continue;
          }

          // Calculate tentative g score
          let sumg = currentNode.gscore + g(currentNode, neighbor);

          // Check if this path to the neighbor is better
          if (!openSet.includes(neighbor) || sumg < neighbor.gscore) {
            neighbor.gscore = sumg;
            neighbor.fscore = neighbor.gscore + neighbor.hscore;
            neighbor.previous = currentNode;

            if (!openSet.includes(neighbor)) {
              openSet.push(neighbor);
            }
          }
        }
      }
    }
    await sleep(50);
  }
  
}

// Construct hScores (heuristic) for all nodes
function construct_hScores() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      grid[y][x].hscore = h(grid[y][x], endNode);
    }
  }
}

// Heuristic function (Manhattan distance with wall penalty)
function h(node, endNode) {
  if (node.state === "wall") {
    return distance(node, endNode) + 100000;
  } else {
    return distance(node, endNode);
  }
}

// g function to calculate distance from start node
function g(startNode, node) {
  return distance(startNode, node);
}

// Translate mouse position to grid position
function mouseTrans() {
  mousePOS = createVector(floor(mouse.x / cellSize), floor(mouse.y / cellSize));
}

// Distance function (Euclidean distance)
function distance(nodeOne, nodeTwo) {
  return Math.sqrt(Math.pow(nodeOne.gridPOS.x - nodeTwo.gridPOS.x, 2) +
                   Math.pow(nodeOne.gridPOS.y - nodeTwo.gridPOS.y, 2));
}

// Helper function to find max of an array
function findHighest(arr) {
  let max = 0;
  let maxI = 0;
  for (let i = 0; i < arr.length; i++) { // Changed from size() to length for array
    if (arr[i] > max) {
      max = arr[i];
      maxI = i;
    }
  }
  return maxI;
}

function removeFromArray(arr, element) {
  const index = arr.indexOf(element);
  if (index > -1) {
    arr.splice(index, 1); // Removes the element at the found index
  }
}

function sleep(ms) {
  console.log("timer started")
  return new Promise(resolve => setTimeout(resolve, ms));
}
