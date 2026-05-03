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
) => {
	const c = document.querySelector(canvas) as HTMLCanvasElement;
	const ctx = c.getContext("2d");
	if (!ctx) return;

	config = { initialLife: 1, keepDead: false, ...config };

	let particles: Particle[] = Array.from({ length: config.count }, (_, i) => {
		const p = init(i);
		return { ...p, life: p.life ?? config.initialLife };
	});

	let lastTime = 0;

	const loop = (currentTime: number) => {
		const dt = (currentTime - lastTime) / 1000;

		lastTime = currentTime;
		ctx.clearRect(0, 0, c.width, c.height);

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

	requestAnimationFrame(loop);
};
