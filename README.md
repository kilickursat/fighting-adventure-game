# Fighting Adventure Game

A browser-based 3D fighting action-adventure game built with Three.js.

## Features

- 3D fighting game with action-adventure elements
- Multiple playable characters with unique abilities
- Different environments with interactive elements
- Skill-based combat system
- Responsive UI with health bars and skill indicators

## Characters

### Warrior
- Melee combat specialist
- Rage-based resource system
- Skills: Heavy Strike, Whirlwind, Battle Cry

### Mage
- Ranged spell caster
- Mana-based resource system
- Skills: Fireball, Ice Barrier, Lightning Storm

## Environments

### Arena
- Gladiatorial combat setting
- Torch-lit atmosphere
- Audience reactions based on combat intensity

### Forest
- Natural environment with trees and rocks
- Dynamic lighting with day/night cycle
- Environmental hazards and obstacles

## Controls

- WASD: Movement
- E: Basic Attack
- Q: Block
- Space: Jump
- 1-3: Special Skills

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/fighting-adventure.git
cd fighting-adventure
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

```
npm run build
```

The production-ready files will be in the `dist` directory.

## Technologies Used

- Three.js for 3D rendering
- Webpack for bundling
- ES6+ JavaScript
- HTML5 and CSS3

## Project Structure

- `src/` - Source code
  - `game/` - Game logic
    - `characters/` - Character classes
    - `environments/` - Environment classes
    - `scenes/` - Scene management
    - `ui/` - User interface components
    - `renderer/` - Rendering system
    - `input/` - Input handling
  - `assets/` - Game assets (models, textures, sounds)
- `public/` - Static files
- `dist/` - Production build (generated)

## License

All rights reserved. Copyright (c) 2023 kilickursat.

This code may not be used publicly without explicit permission from the copyright holder. The copyright holder is open to offers and inquiries regarding licensing or usage of the software.

## Acknowledgments

- Three.js community for the excellent 3D library
- Contributors and testers who helped improve the game 