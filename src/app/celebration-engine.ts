export type CelebrationMode = "confetti" | "airdrop" | "balloons";

export type PhysicsSettings = {
  count: number;
  speed: number;
  gravity: number;
  drag: number;
  wind: number;
};

export type SoundSettings = {
  cheer: boolean;
  applause: boolean;
  whistle: boolean;
};

export type ParticleKind = "paper" | "emoji" | "balloon";

export type PhysicalParticle = {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  wind: number;
  rotation: number;
  spin: number;
  width: number;
  height: number;
  color: string;
  emoji: string | null;
  stringLength: number;
  phase: number;
  flutter: number;
  age: number;
  lifetime: number;
};

type WorldBounds = {
  width: number;
  height: number;
};

export class CelebrationPhysicsEngine {
  step(particle: PhysicalParticle, deltaSeconds: number) {
    particle.age += deltaSeconds;
    particle.vx += particle.wind * deltaSeconds;
    particle.vx +=
      Math.sin(particle.age * particle.flutter + particle.phase) *
      particle.flutter *
      26 *
      deltaSeconds;
    const frameDrag = Math.pow(particle.drag, deltaSeconds * 60);
    particle.vx *= frameDrag;
    particle.vy = (particle.vy + particle.gravity * deltaSeconds) * frameDrag;
    particle.x += particle.vx * deltaSeconds;
    particle.y += particle.vy * deltaSeconds;
    particle.rotation += particle.spin * deltaSeconds;
  }

  hasLeftWorld(particle: PhysicalParticle, bounds: WorldBounds) {
    return (
      particle.age >= particle.lifetime ||
      particle.y > bounds.height + 50 ||
      particle.y < -particle.height - particle.stringLength ||
      particle.x < -50 ||
      particle.x > bounds.width + 50
    );
  }

  opacity(particle: PhysicalParticle) {
    const fadeStart = particle.lifetime * 0.75;
    return particle.age > fadeStart
      ? 1 - (particle.age - fadeStart) / (particle.lifetime - fadeStart)
      : Math.min(1, particle.age / 0.16);
  }

  flutterScale(particle: PhysicalParticle) {
    return Math.max(
      0.18,
      Math.abs(Math.cos(particle.age * particle.flutter + particle.phase)),
    );
  }
}
