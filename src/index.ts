export interface Particle {
	x: number;
	y: number;
	vx?: number;
	vy?: number;
	life: number;
	[key: string]: any;
}

export interface Config {
	count: number;
	maxCount?: number;
	respawn?: boolean;
	keepDead?: boolean;
	autoStart?: boolean;
	clearCanvas?: boolean;
	forces?: Force[];
}

export interface Options {
	init: (index: number) => Particle;
	update: (p: Particle, dt: number) => void;
	render: (p: Readonly<Particle>, ctx: CanvasRenderingContext2D) => void;
}

export type Force = (p: Particle, dt: number) => void;

/** Pulls particles downward. */
export const gravity =
	(strength: number = 9.8): Force =>
	(p: Particle, dt: number) => {
		p.vy = (p.vy ?? 0) + strength * dt;
	};
/** Applies horizontal wind. */
export const wind =
	(strength: number = 10): Force =>
	(p: Particle, dt: number) => {
		p.vx = (p.vx ?? 0) + strength * dt;
	};

export const createParticles = (
	canvas: string | HTMLCanvasElement,
	{ init, update, render }: Options,
	config: Config,
): {
	start: () => void;
	stop: () => void;
	toggle: () => void;
	emit: (n: number) => void;
	readonly running: boolean;
	readonly particles: Particle[];
} => {
	const c =
		typeof canvas === "string"
			? (document.querySelector(canvas) as HTMLCanvasElement)
			: canvas;
	if (!c) throw new Error(`Canvas "${canvas}" not found`);

	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("Couldn't get 2D context");

	config = {
		respawn: true,
		keepDead: false,
		autoStart: false,
		clearCanvas: true,
		...config,
	};

	const count = config.maxCount
		? Math.min(config.count, config.maxCount)
		: config.count;

	let particles: Particle[] = Array.from({ length: count }, (_, i) => init(i));

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

		const forces = config.forces ?? [];

		for (const p of particles) {
			update(p, dt);
			for (const force of forces) force(p, dt);
			p.x += (p.vx ?? 0) * dt;
			p.y += (p.vy ?? 0) * dt;
		}

		if (config.respawn) {
			particles = particles.map((p, i) => (p.life <= 0 ? { ...init(i) } : p));
		} else if (!config.keepDead) {
			particles = particles.filter((p) => p.life > 0);
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

	const toggle = () => (running ? stop() : start());

	const emit = (n: number) => {
		const existing = particles.length;
		for (let i = 0; i < n; i++) {
			if (config.maxCount !== undefined && existing + i >= config.maxCount)
				break;

			const p = init(existing + i);
			particles.push(p);
		}
	};

	if (config.autoStart) {
		start();
	}

	return {
		start,
		stop,
		toggle,
		emit,
		get running() {
			return running;
		},
		get particles() {
			return particles;
		},
	};
};
