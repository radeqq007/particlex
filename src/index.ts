export interface Particle {
	x: number;
	y: number;
	life?: number;
	[key: string]: any;
}

export interface Config {
	count: number;
	initialLife?: number;
	respawn?: boolean;
	keepDead?: boolean;
	autoStart?: boolean;
  clearCanvas?: boolean;
}

export interface Options {
	init: (index: number) => Particle;
	update: (p: Particle, dt: number) => void;
	render: (p: Particle, ctx: CanvasRenderingContext2D) => void;
}

export const createParticles = (
	canvas: string,
	{ init, update, render }: Options,
	config: Config,
): {
	start: () => void;
	stop: () => void;
  toggle: () => void;
  readonly running: boolean;
	readonly particles: Particle[];
} => {
	const c = document.querySelector(canvas) as HTMLCanvasElement;
	if (!c) throw new Error(`Canvas "${canvas}" not found`);

	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("Couldn't get 2D context");

	config = {
		initialLife: 1,
		respawn: true,
		keepDead: false,
		autoStart: false,
    clearCanvas: true,
		...config,
	};

	let particles: Particle[] = Array.from({ length: config.count }, (_, i) => {
		const p = init(i);
		return { ...p, life: p.life ?? config.initialLife };
	});

	let lastTime = 0;
	let id: number | null = null;
	let running: boolean = false;

	const loop = (currentTime: number) => {
    if (!running) return;

		const dt = (currentTime - lastTime) / 1000;

		lastTime = currentTime;

    if (config.clearCanvas) {
      ctx.clearRect(0, 0, c.width, c.height);
    }

		for (const p of particles) {
			update(p, dt);
		}

		if (config.respawn) {
			particles = particles.map((p, i) =>
				p.life! <= 0 ? { ...init(i), life: config.initialLife } : p,
			);
		} else if (!config.keepDead) {
			particles = particles.filter((p) => p.life! > 0);
		}

		for (const p of particles) {
			render(p, ctx);
		}

		requestAnimationFrame(loop);
	};

	const start = () => {
		if (running) return;
		running = true;
		lastTime = performance.now();
		id = requestAnimationFrame(loop);
	};

	const stop = () => {
		running = false;
		if (!id) return;

		cancelAnimationFrame(id);
		id = null;
	};

  const toggle = () => running ? stop() : start()

	if (config.autoStart) {
		start();
	}

	return {
		start,
		stop,
    toggle,
    get running() {
      return running
    },
		get particles() {
			return particles;
		},
	};
};
