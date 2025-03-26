# Software Design Document (SDD): AI Agent for Flappy Bird-like Game

## 1. Introduction

### 1.1 Purpose
This document outlines the steps required for an AI agent in an IDE to create a simple Flappy Bird-like game for the web browser. The game will use spacebar (`SPACE`) as the only control to make the bird jump between obstacles.

### 1.2 Scope
- [x] The game will be implemented using HTML5, JavaScript, and Canvas API.
- [x] It will feature basic physics (gravity and jumping mechanics).
- [x] Obstacles will move towards the player.
- [x] Collision detection will determine if the player loses.
- [x] A simple scoring system will be included.
- [x] The project will run in a modern web browser.

## 2. Requirements

### 2.1 Functional Requirements
- [x] The game must render in a web browser.
- [x] The player must be able to control the bird with the spacebar.
- [x] Gravity should pull the bird down over time.
- [x] Obstacles should move from right to left.
- [x] The game should detect collisions between the bird and obstacles.
- [x] The player should see a score based on how long they survive.
- [x] The game should restart when the player loses.

### 2.2 Non-Functional Requirements
- [x] The game should run at 60 FPS.
- [x] The UI should be minimalistic and responsive.
- [x] The game should have a lightweight codebase (< 1MB JavaScript).

## 3. System Design

### 3.1 Architecture
- [x] Use JavaScript for game logic.
- [x] Use HTML5 Canvas for rendering.
- [x] Implement a game loop using `requestAnimationFrame`.
- [x] Maintain a simple state machine (running, game over).

### 3.2 Components

#### 3.2.1 Game Loop
- [x] Implement `update()` function to process game logic.
- [x] Implement `draw()` function to render objects on canvas.
- [x] Call `requestAnimationFrame()` to maintain smooth animation.

#### 3.2.2 Bird
- [x] Create a `Bird` object with position and velocity.
- [x] Implement gravity to pull the bird down.
- [x] Implement a `jump()` method that modifies velocity when spacebar is pressed.

#### 3.2.3 Obstacles
- [x] Generate pipes at fixed intervals.
- [x] Move obstacles from right to left.
- [x] Remove obstacles when they leave the screen.

#### 3.2.4 Collision Detection
- [x] Check if the bird intersects with an obstacle.
- [x] Check if the bird touches the ground.

#### 3.2.5 Score System
- [x] Increase score when the bird successfully passes an obstacle.
- [x] Display the score on the screen.

#### 3.2.6 Game Over State
- [x] Display a game-over message when the player loses.
- [x] Allow the player to restart by pressing the Enter key.

## 4. Implementation Plan

### 4.1 Setup
- [x] Create `index.html`, `style.css`, and `game.js`.
- [x] Initialize an HTML5 canvas in `index.html`.
- [x] Set up basic styles in `style.css`.
- [x] Implement a script in `game.js` to initialize the game.

### 4.2 Development Steps

#### Step 1: Canvas Setup
- [x] Create an HTML5 canvas element.
- [x] Set up a `2D` rendering context.
- [x] Draw a static bird image as a placeholder.

#### Step 2: Game Loop
- [x] Implement `update()` and `draw()` functions.
- [x] Use `requestAnimationFrame()` to create a continuous loop.

#### Step 3: Bird Physics
- [x] Implement gravity in the `Bird` object.
- [x] Add a `jump()` function triggered by spacebar.
- [x] Render the bird's position in `draw()`.

#### Step 4: Obstacles
- [x] Create a class for pipes.
- [x] Randomize the height of gaps.
- [x] Move pipes from right to left.
- [x] Remove off-screen pipes.

#### Step 5: Collision Detection
- [x] Check if the bird touches a pipe or the ground.
- [x] End the game if a collision is detected.

#### Step 6: Scoring System
- [x] Increase score when the bird passes a pipe.
- [x] Display the score on the screen.

#### Step 7: Game Over & Restart
- [x] Display "Game Over" when the player loses.
- [x] Reset the game when spacebar is pressed.

## 5. Testing Plan

### 5.1 Unit Tests
- [x] Test bird physics (gravity, jumping).
- [x] Test obstacle spawning and movement.
- [x] Test collision detection logic.

### 5.2 Integration Tests
- [x] Ensure game loop updates correctly.
- [x] Ensure obstacles and bird interact correctly.
- [x] Ensure score increments properly.

### 5.3 User Testing
- [x] Check if the controls feel responsive.
- [x] Check if the difficulty feels fair.
- [x] Ensure the game restarts correctly after failure.

## 6. Deployment

- [x] Minify and bundle JavaScript for production.
- [x] Host on GitHub Pages or Netlify.
- [x] Ensure compatibility with Chrome, Firefox, and Edge.

## 7. Future Improvements

- [x] Add sound effects.
- [x] Add animated sprites.
- [x] Implement a leaderboard.
- [x] Make the background dynamic.
- [x] Make the space between pipes wider (2x time).
- [x] Add control for speed same to gravity.
- [x] Reduce a height of a jump (3x time less).
- [x] Add a controller same to gravity and speed for a jump height.
- [x] Make possible to add the result to the scoreboard even if it already full. Store the players with top 5 results.
