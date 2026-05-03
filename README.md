# Particlex

## Installation

```sh
npm install particlex
pnpm add particlex
yarn add particlex
```

## Example usage

```ts
import { createParticles } from "particlex";
import type { Particle } from "particlex";

const init = (i: number): Particle => {
  return { x: 5, y: 5 };
}

const update = (p: Particle, dt: number) => {
  p.x = p.x + (4 * dt);
  p.y = p.y + Math.random() * 5 - 2.5;
  p.life! -= 0.1;
}

const render = (p: Particle, ctx: CanvasRenderingContext2D, dt: number) => {
  ctx.fillStyle = "red";
  ctx.fillRect(p.x, p.y, 5, 5);
}

createParticles("#canvas", { init, update, render }, { initialLife: 1, count: 4 });
```
