# Time Travel Strategy Game

A prototype turn-based strategy game where players navigate through both space and time, placing traps and attempting to be the last one standing.

**[👉 Play Live Demo](https://levkobe.github.io/time-goes/)**

## What is this?

This is an early playable sketch exploring time travel mechanics in a grid-based strategy game. Players move through a 3D spacetime grid (2D space + 1D time), can place traps in the past that persist into the future, and must outmaneuver opponents across multiple time slices.

## Core Concept

### The Spacetime Grid
The game takes place across multiple **time slices** (t=0, t=1, t=2...), each containing a 2D spatial grid. Players exist at a single point in spacetime but can move freely between time periods.

```
Time t=0        Time t=1        Time t=2
┌───┬───┐      ┌───┬───┐      ┌───┬───┐
│ P1│   │      │   │   │      │   │   │
├───┼───┤  →   ├───┼───┤  →   ├───┼───┤
│   │ P2│      │   │ P1│      │   │   │
└───┴───┘      └───┴───┘      └───┴───┘
```

### Movement System
Each turn, players move **one step** in any direction:
- **Spatial**: Up, down, left, right
- **Temporal**: Forward or backward in time

### Trap Mechanics
Players start with one trap that can be placed on any valid move location. Key properties:
- Traps are **invisible** to opponents
- Once placed at coordinates (t, x, y), the trap **persists from time t forward**
- Stepping on an opponent's trap = elimination
- Red dots show your own trap locations

## How to Play

**Controls:**
- **Left Click**: Move to a green highlighted cell
- **Right Click**: Place trap on an orange highlighted cell

**Win Condition:**
Last player alive wins

**Elimination:**
- Stepping on enemy traps
- Colliding with another player (both eliminated)

## Implementation Notes

This is a **prototype** focusing on core mechanics. Current features:
- ✅ 3D spacetime grid navigation
- ✅ Turn-based movement system
- ✅ Trap placement and triggering
- ✅ Collision detection
- ✅ Win condition checking

Known limitations:
- No temporal paradox resolution
- Limited AI/opponent variety
- Trap visualization is basic
- No undo/replay system

## Tech Stack

- **TypeScript** - Type-safe game logic
- **Vanilla JS/HTML/CSS** - Lightweight UI
- **Vite** - Build tooling

## Local Development

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── coordinate.ts   # 3D position handling (t, x, y)
├── player.ts       # Player state and actions
├── tool.ts         # Trap mechanics
├── gamestate.ts    # Game state management
├── game.ts         # Main game controller & rendering
├── types.ts        # TypeScript interfaces
└── main.ts         # Entry point
```

---

*This is an experimental prototype exploring time travel in strategy games. Feedback welcome!*
