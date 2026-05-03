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

const init = (_: number): Particle => {
  return { x: Math.random() * 100, y: Math.random() * 100 };
}

const update = (p: Particle, dt: number) => {
  p.y = p.y + (40 * dt);
  p.x = p.x + Math.random() * 5 - 2.5;
  p.life! -= Math.random() * 0.2;
}

const render = (p: Particle, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "red";
  ctx.fillRect(p.x, p.y, 8, 8);
  ctx.fillText(p.life!.toFixed(2).toString(), p.x, p.y - 5)
}

createParticles("#canvas", { init, update, render }, { initialLife: 10, count: 80, autoStart: true });
```

