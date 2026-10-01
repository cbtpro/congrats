"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  CelebrationPhysicsEngine,
  type CelebrationMode,
  type PhysicsSettings,
  type PhysicalParticle as Particle,
  type SoundSettings,
} from "./celebration-engine";
import styles from "./page.module.css";

type BusinessScenario = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  metricLabel: string;
  metric: string;
  detailLabel: string;
  detail: string;
  action: string;
};

type ConfettiPalette = {
  id: string;
  name: string;
  colors: string[];
};

type FlyingActor = {
  x: number;
  y: number;
  direction: 1 | -1;
  progress: number;
  duration: number;
  startX: number;
  startY: number;
  control1X: number;
  control1Y: number;
  control2X: number;
  control2Y: number;
  endX: number;
  endY: number;
  age: number;
  dropTimer: number;
};

type CelebrationCanvasProps = {
  burstKey: number;
  modes: CelebrationMode[];
  palette: ConfettiPalette;
  physics: PhysicsSettings;
};

const scenarios: BusinessScenario[] = [
  {
    id: "achievement",
    label: "成就完成",
    eyebrow: "ACHIEVEMENT UNLOCKED",
    title: "连续打卡 30 天",
    description: "坚持的每一天，都值得被看见。",
    icon: "🏆",
    metricLabel: "获得奖励",
    metric: "+500 积分",
    detailLabel: "新成就",
    detail: "自律达人",
    action: "查看我的成就",
  },
  {
    id: "goal",
    label: "目标达成",
    eyebrow: "GOAL COMPLETED",
    title: "本月销售目标达成",
    description: "团队一起努力，交出漂亮成绩。",
    icon: "🎯",
    metricLabel: "目标完成率",
    metric: "128%",
    detailLabel: "累计销售额",
    detail: "¥128,600",
    action: "查看数据报告",
  },
  {
    id: "order",
    label: "下单成功",
    eyebrow: "ORDER CONFIRMED",
    title: "订单提交成功",
    description: "好物即将启程，感谢你的选购。",
    icon: "🛍️",
    metricLabel: "实付款",
    metric: "¥299.00",
    detailLabel: "订单编号",
    detail: "2026100100836",
    action: "查看订单详情",
  },
  {
    id: "flash-sale",
    label: "秒杀成功",
    eyebrow: "YOU GOT THE DEAL",
    title: "限时秒杀成功！",
    description: "手速太快啦，心仪好物已抢到。",
    icon: "⚡",
    metricLabel: "秒杀到手价",
    metric: "¥9.90",
    detailLabel: "商品",
    detail: "无线蓝牙耳机",
    action: "查看抢购订单",
  },
];

const palettes: ConfettiPalette[] = [
  { id: "festival", name: "缤纷派对", colors: ["#ff5c70", "#ffc247", "#4ecb9a", "#5595ff", "#b376ed"] },
  { id: "gold", name: "鎏金时刻", colors: ["#a86b16", "#e6a832", "#ffdc73", "#fff0b3", "#d58a26"] },
  { id: "pastel", name: "柔和彩虹", colors: ["#f18ca7", "#ffc980", "#f5e589", "#91d5bd", "#9bbdff"] },
  { id: "ocean", name: "海盐微风", colors: ["#176f87", "#289fb3", "#78d4d2", "#add9ef", "#426fc2"] },
  { id: "berry", name: "莓果气泡", colors: ["#ac315f", "#e64b78", "#ff91aa", "#be74cc", "#7956bb"] },
  { id: "citrus", name: "柑橘汽水", colors: ["#ed6338", "#ff9a38", "#ffd341", "#a8c83e", "#53b77a"] },
  { id: "meadow", name: "春日花园", colors: ["#db5d79", "#f49b64", "#e5c84a", "#63a876", "#7298d3"] },
  { id: "lavender", name: "薰衣草", colors: ["#7457ba", "#9979dc", "#c1a5ed", "#ed9ad4", "#75a5df"] },
  { id: "neon", name: "霓虹闪耀", colors: ["#ff3c69", "#ff9d26", "#d3f43f", "#30dfc0", "#7a65ff"] },
  { id: "mono", name: "黑白经典", colors: ["#202b27", "#4c5a53", "#84918a", "#c4cbc5", "#e6e9e5"] },
];

const celebrationModes: { id: CelebrationMode; name: string; icon: string; description: string }[] = [
  { id: "confetti", name: "两侧彩纸礼炮", icon: "🎊", description: "彩纸从左右两侧抛向空中" },
  { id: "airdrop", name: "飞机撒彩纸", icon: "✈️", description: "飞机掠过上空，沿途洒下彩纸" },
  { id: "balloons", name: "放飞气球", icon: "🎈", description: "彩色气球乘风缓缓升空" },
];

const celebrationEmojis = ["🎉", "✨", "🎊", "🌸", "🎈", "💐", "🥳", "🌟"];
const defaultPhysics: PhysicsSettings = {
  count: 160,
  speed: 1,
  gravity: 680,
  drag: 0.992,
  wind: 0,
};

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function cubicBezier(start: number, control1: number, control2: number, end: number, t: number) {
  const inverse = 1 - t;
  return (
    inverse ** 3 * start +
    3 * inverse ** 2 * t * control1 +
    3 * inverse * t ** 2 * control2 +
    t ** 3 * end
  );
}

function bezierTangent(
  start: number,
  control1: number,
  control2: number,
  end: number,
  t: number,
) {
  const inverse = 1 - t;
  return (
    3 * inverse ** 2 * (control1 - start) +
    6 * inverse * t * (control2 - control1) +
    3 * t ** 2 * (end - control2)
  );
}

function CelebrationCanvas({
  burstKey,
  modes,
  palette,
  physics,
}: CelebrationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsRef = useRef(physics);
  physicsRef.current = physics;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || burstKey === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const settings = physicsRef.current;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const scale = Math.max(0.72, Math.min(width / 1440, 1.35));
    const particles: Particle[] = [];
    const actors: FlyingActor[] = [];
    const physicsEngine = new CelebrationPhysicsEngine();
    const airplane = new Image();
    const assetBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    airplane.src = `${assetBasePath}/celebration-assets/airplane.svg`;
    const timers: number[] = [];
    let animationFrame = 0;
    let burstFinished = false;
    let lastFrameTime = performance.now();
    const random = seededRandom(Date.now() + burstKey * 7919);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const addPaper = (x: number, y: number, vx: number, vy: number) => {
      const isEmoji = random() < 0.06;
      particles.push({
        kind: isEmoji ? "emoji" : "paper",
        x,
        y,
        vx,
        vy,
        gravity: settings.gravity,
        drag: settings.drag,
        wind: settings.wind,
        rotation: random() * Math.PI * 2,
        spin: (random() - 0.5) * 11,
        width: (isEmoji ? 20 : 5 + random() * 8) * scale,
        height: (isEmoji ? 20 : 8 + random() * 12) * scale,
        color: palette.colors[Math.floor(random() * palette.colors.length)],
        emoji: isEmoji ? celebrationEmojis[Math.floor(random() * celebrationEmojis.length)] : null,
        stringLength: 0,
        phase: random() * Math.PI * 2,
        flutter: 2 + random() * 4,
        age: 0,
        lifetime: 3.5 + random() * 2.5,
      });
    };

    const launchConfetti = (wave: number) => {
      const count = Math.ceil(settings.count / 3);
      for (let index = 0; index < count; index += 1) {
        const fromLeft = index % 2 === 0;
        const originX = fromLeft
          ? random() * width * 0.08
          : width - random() * width * 0.08;
        const angleSpread = 0.25 + random() * 0.08;
        const angle = fromLeft
          ? -Math.PI * angleSpread
          : -Math.PI * (1 - angleSpread);
        const speed = (540 + random() * 300) * settings.speed * scale;
        const horizontal = Math.cos(angle) * speed;
        const vertical = Math.sin(angle) * speed;
        addPaper(originX, height * (0.78 + random() * 0.2), horizontal, vertical);
      }
    };

    const launchBalloons = () => {
      const balloonCount = Math.max(12, Math.round(settings.count / 6));
      for (let index = 0; index < balloonCount; index += 1) {
        const hueColor = palette.colors[Math.floor(random() * palette.colors.length)];
        particles.push({
          kind: "balloon",
          x: width * (0.08 + random() * 0.84),
          y: height * (0.82 + random() * 0.22),
          vx: (random() - 0.5) * 28 * settings.speed,
          vy: -(70 + random() * 75) * settings.speed,
          gravity: -18,
          drag: 0.998,
          wind: settings.wind,
          rotation: (random() - 0.5) * 0.14,
          spin: (random() - 0.5) * 0.18,
          width: 16 + random() * 13,
          height: 21 + random() * 15,
          color: hueColor,
          emoji: null,
          stringLength: 32 + random() * 32,
          phase: random() * Math.PI * 2,
          flutter: 1 + random() * 1.2,
          age: 0,
          lifetime: 9 + random() * 4,
        });
      }
    };

    const launchAirplane = () => {
      const direction: 1 | -1 = random() > 0.5 ? 1 : -1;
      const startX = direction === 1 ? -80 : width + 80;
      const endX = direction === 1 ? width + 80 : -80;
      const distance = Math.abs(endX - startX);
      const startY = height * (0.23 + random() * 0.16);
      const endY = startY + (random() - 0.5) * height * 0.07;
      const arcHeight = (0.075 + random() * 0.045) * height;
      const arc = arcHeight * (random() > 0.5 ? 1 : -1);

      actors.push({
        x: startX,
        y: startY,
        direction,
        progress: 0,
        duration: distance / (175 * settings.speed),
        startX,
        startY,
        control1X: startX + (endX - startX) / 3,
        control1Y: startY + (endY - startY) / 3 - arc,
        control2X: startX + ((endX - startX) * 2) / 3,
        control2Y: startY + ((endY - startY) * 2) / 3 - arc,
        endX,
        endY,
        age: 0,
        dropTimer: 0.16,
      });
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const now = performance.now();
      const deltaSeconds = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        physicsEngine.step(particle, deltaSeconds);

        if (physicsEngine.hasLeftWorld(particle, { width, height })) {
          particles.splice(index, 1);
          continue;
        }

        const alpha = physicsEngine.opacity(particle);
        const flutterScale = physicsEngine.flutterScale(particle);

        context.save();
        context.globalAlpha = alpha;
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        if (particle.kind === "balloon") {
          const halfWidth = particle.width / 2;
          const halfHeight = particle.height / 2;
          const sway = Math.sin(particle.age * 1.2 + particle.phase);

          context.beginPath();
          context.moveTo(0, halfHeight * 0.72);
          context.bezierCurveTo(
            halfWidth * 0.4,
            halfHeight + particle.stringLength * 0.28,
            -halfWidth * 0.45 + sway * 4,
            halfHeight + particle.stringLength * 0.72,
            sway * 5,
            halfHeight + particle.stringLength,
          );
          context.strokeStyle = particle.color;
          context.lineWidth = 0.8;
          context.stroke();

          const balloonGradient = context.createRadialGradient(
            -halfWidth * 0.3,
            -halfHeight * 0.3,
            0,
            0,
            0,
            halfWidth * 1.2,
          );
          balloonGradient.addColorStop(0, "#ffffff");
          balloonGradient.addColorStop(0.3, particle.color);
          balloonGradient.addColorStop(1, particle.color);
          context.beginPath();
          context.moveTo(0, -halfHeight);
          context.bezierCurveTo(
            halfWidth * 1.2,
            -halfHeight * 0.95,
            halfWidth * 1.1,
            halfHeight * 0.25,
            halfWidth * 0.25,
            halfHeight * 0.72,
          );
          context.lineTo(halfWidth * 0.09, halfHeight);
          context.lineTo(-halfWidth * 0.09, halfHeight);
          context.lineTo(-halfWidth * 0.25, halfHeight * 0.72);
          context.bezierCurveTo(
            -halfWidth * 1.1,
            halfHeight * 0.25,
            -halfWidth * 1.2,
            -halfHeight * 0.95,
            0,
            -halfHeight,
          );
          context.fillStyle = balloonGradient;
          context.fill();

          context.beginPath();
          context.ellipse(
            -halfWidth * 0.32,
            -halfHeight * 0.15,
            halfWidth * 0.1,
            halfHeight * 0.24,
            -0.25,
            0,
            Math.PI * 2,
          );
          context.fillStyle = "rgba(255, 255, 255, 0.48)";
          context.fill();
        } else if (particle.emoji) {
          context.font = `${particle.width}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(particle.emoji, 0, 0);
        } else {
          context.fillStyle = particle.color;
          context.fillRect(
            -particle.width * flutterScale / 2,
            -particle.height / 2,
            particle.width * flutterScale,
            particle.height,
          );
        }
        context.restore();
      }

      for (let index = actors.length - 1; index >= 0; index -= 1) {
        const actor = actors[index];
        actor.age += deltaSeconds;
        actor.progress = Math.min(1, actor.progress + deltaSeconds / actor.duration);
        actor.x =
          cubicBezier(
            actor.startX,
            actor.control1X,
            actor.control2X,
            actor.endX,
            actor.progress,
          ) +
          settings.wind * actor.age * 0.04;
        actor.y =
          cubicBezier(
            actor.startY,
            actor.control1Y,
            actor.control2Y,
            actor.endY,
            actor.progress,
          );
        actor.dropTimer += deltaSeconds;
        const tangentX = bezierTangent(
          actor.startX,
          actor.control1X,
          actor.control2X,
          actor.endX,
          actor.progress,
        );
        const tangentY = bezierTangent(
          actor.startY,
          actor.control1Y,
          actor.control2Y,
          actor.endY,
          actor.progress,
        );

        const dropInterval = Math.max(0.055, 0.18 - settings.count / 4500);
        if (actor.dropTimer > dropInterval) {
          actor.dropTimer -= dropInterval;
          const tangentMagnitude = Math.hypot(tangentX, tangentY);
          const behindPlane = actor.x - (tangentX / tangentMagnitude) * 30;
          const behindPlaneY = actor.y - (tangentY / tangentMagnitude) * 30;
          const pieces = Math.round(1 + settings.count / 90);
          for (let piece = 0; piece < pieces; piece += 1) {
            addPaper(
              behindPlane + (random() - 0.5) * 8 - (tangentX / tangentMagnitude) * piece * 2,
              behindPlaneY + piece * 3,
              tangentX / actor.duration + settings.wind * 0.05 + (random() - 0.5) * 45,
              tangentY / actor.duration + 35 + random() * 50,
            );
          }
        }

        if (actor.progress >= 1) {
          actors.splice(index, 1);
          continue;
        }

        context.save();
        const spriteWidth = 54 * scale;
        const edgeFade = Math.min(
          1,
          Math.max(0, (actor.x + spriteWidth) / (spriteWidth * 1.5)),
          Math.max(0, (width + spriteWidth - actor.x) / (spriteWidth * 1.5)),
        );
        context.globalAlpha = Math.min(1, actor.age / 0.6) * edgeFade;
        context.translate(actor.x, actor.y);
        const flightAngle = Math.atan2(tangentY, tangentX) + Math.PI / 4;
        context.rotate(flightAngle);
        if (airplane.complete && airplane.naturalWidth > 0) {
          context.drawImage(
            airplane,
            -spriteWidth / 2,
            -spriteWidth / 2,
            spriteWidth,
            spriteWidth,
          );
        } else {
          context.font = `${spriteWidth}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText("✈️", 0, 0);
        }
        context.restore();
      }

      if (!burstFinished || particles.length > 0 || actors.length > 0) {
        animationFrame = window.requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, width, height);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    if (modes.includes("confetti")) {
      launchConfetti(0);
      timers.push(window.setTimeout(() => launchConfetti(1), 120));
      timers.push(window.setTimeout(() => launchConfetti(2), 260));
    }
    if (modes.includes("airdrop")) launchAirplane();
    if (modes.includes("balloons")) launchBalloons();
    timers.push(window.setTimeout(() => {
      burstFinished = true;
    }, modes.includes("confetti") ? 400 : 100));
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
      timers.forEach(window.clearTimeout);
      context.clearRect(0, 0, width, height);
    };
  }, [burstKey, modes, palette]);

  return <canvas ref={canvasRef} className={styles.confettiCanvas} aria-hidden="true" />;
}

function ScenarioIcon({ icon }: { icon: string }) {
  return <span className={styles.scenarioIcon}>{icon}</span>;
}

export default function Home() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [modes, setModes] = useState<CelebrationMode[]>(["confetti"]);
  const [paletteId, setPaletteId] = useState(palettes[0].id);
  const [physics, setPhysics] = useState(defaultPhysics);
  const [sounds, setSounds] = useState<SoundSettings>({
    cheer: false,
    applause: false,
    whistle: false,
  });
  const [burstKey, setBurstKey] = useState(1);
  const audioRef = useRef<Record<keyof SoundSettings, HTMLAudioElement | null>>({
    cheer: null,
    applause: null,
    whistle: null,
  });
  const soundFadeFramesRef = useRef<Record<keyof SoundSettings, number | null>>({
    cheer: null,
    applause: null,
    whistle: null,
  });
  const [audioError, setAudioError] = useState("");

  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const palette = palettes.find((item) => item.id === paletteId) ?? palettes[0];
  const selectedModes = celebrationModes.filter((item) => modes.includes(item.id));

  function playSound(sound: keyof SoundSettings) {
    const assetBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const audioFiles: Record<keyof SoundSettings, string> = {
      cheer: `${assetBasePath}/sounds/crowd-cheer.mp3`,
      applause: `${assetBasePath}/sounds/applause.mp3`,
      whistle: `${assetBasePath}/sounds/celebration-whistle.mp3`,
    };
    const audio = audioRef.current[sound] ?? new Audio(audioFiles[sound]);
    audioRef.current[sound] = audio;
    const previousFrame = soundFadeFramesRef.current[sound];
    if (previousFrame !== null) window.cancelAnimationFrame(previousFrame);
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0;
    void audio.play()
      .then(() => {
        const startedAt = performance.now();
        const fadeVolume = () => {
          if (audio.paused || audio.ended) {
            soundFadeFramesRef.current[sound] = null;
            return;
          }

          const elapsed = performance.now() - startedAt;
          const fadeIn = Math.min(1, elapsed / 900);
          const remaining = Number.isFinite(audio.duration)
            ? Math.max(0, audio.duration - audio.currentTime) * 1000
            : Number.POSITIVE_INFINITY;
          const fadeOut = Math.min(1, remaining / 2200);
          audio.volume = 0.45 * fadeIn * fadeOut;
          soundFadeFramesRef.current[sound] = window.requestAnimationFrame(fadeVolume);
        };
        soundFadeFramesRef.current[sound] = window.requestAnimationFrame(fadeVolume);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAudioError("音效播放失败，请检查浏览器的音频权限。");
      });
  }

  function toggleSound(sound: keyof SoundSettings, enabled: boolean) {
    setSounds((current) => ({ ...current, [sound]: enabled }));
    setAudioError("");
    if (enabled) {
      playSound(sound);
      return;
    }

    const frame = soundFadeFramesRef.current[sound];
    if (frame !== null) window.cancelAnimationFrame(frame);
    soundFadeFramesRef.current[sound] = null;
    const audio = audioRef.current[sound];
    if (audio) {
      audio.pause();
      audio.volume = 0;
      audio.currentTime = 0;
    }
  }

  function celebrate() {
    setBurstKey((key) => key + 1);
    setAudioError("");
    (Object.keys(sounds) as (keyof SoundSettings)[])
      .filter((sound) => sounds[sound])
      .forEach(playSound);
  }

  function setPhysicsValue<Key extends keyof PhysicsSettings>(
    key: Key,
    value: PhysicsSettings[Key],
  ) {
    setPhysics((current) => ({ ...current, [key]: value }));
  }

  function toggleMode(mode: CelebrationMode) {
    setModes((current) =>
      current.includes(mode)
        ? current.length > 1
          ? current.filter((item) => item !== mode)
          : current
        : [...current, mode],
    );
    celebrate();
  }

  return (
    <main className={styles.page}>
      <CelebrationCanvas
        burstKey={burstKey}
        modes={modes}
        palette={palette}
        physics={physics}
      />
      <header className={styles.header}>
        <a href="#" className={styles.brand} aria-label="恭喜效果实验室首页">
          <span className={styles.brandSymbol}>✳</span>
          <span>好彩头</span>
          <span className={styles.brandSub}>CONFETTI LAB</span>
        </a>
        <span className={styles.headerMeta}>
          <span className={styles.liveDot} /> 自由组合 · 自定义物理
        </span>
      </header>

      <section className={styles.intro}>
        <div>
          <p className={styles.kicker}>A LITTLE CONFETTI, A LOT OF JOY</p>
          <h1>
            好消息，
            <span>让快乐自由发生。</span>
          </h1>
        </div>
        <p className={styles.introCopy}>
          选一个真实的成功时刻，再挑一场喜欢的庆祝。
          <br />
          彩纸、飞机和气球，再加上欢呼、掌声和口哨。
        </p>
      </section>

      <section className={styles.demoSection} aria-label="成功庆祝效果预览">
        <div className={styles.stage}>
          <div className={styles.stageGrid} aria-hidden="true" />
          <div className={styles.stageTopline}>
            <span className={styles.stageLabel}>
              <span className={styles.stagePulse} />
              LIVE PREVIEW
            </span>
            <span className={styles.stageEffect}>
              {selectedModes.map((item) => item.name).join(" + ").toUpperCase()}
            </span>
          </div>

          <div className={styles.successWindow}>
            <div className={styles.windowBar}>
              <div className={styles.windowDots}>
                <i />
                <i />
                <i />
              </div>
              <span>SUCCESS</span>
              <span className={styles.windowLock}>● SECURE</span>
            </div>
            <div className={styles.successContent}>
              <div className={styles.successBadge}>
                <span className={styles.successBadgeRing}>
                  <ScenarioIcon icon={scenario.icon} />
                </span>
              </div>
              <p className={styles.successEyebrow}>{scenario.eyebrow}</p>
              <h2>{scenario.title}</h2>
              <p className={styles.successDescription}>{scenario.description}</p>
              <div className={styles.successMetrics}>
                <div>
                  <span>{scenario.metricLabel}</span>
                  <strong>{scenario.metric}</strong>
                </div>
                <i />
                <div>
                  <span>{scenario.detailLabel}</span>
                  <strong>{scenario.detail}</strong>
                </div>
              </div>
              <button className={styles.successAction} onClick={celebrate}>
                {scenario.action} <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>

          <div className={styles.stageFooter}>
            <span>
              当前演出：<strong>{selectedModes.map((item) => item.name).join(" + ")}</strong>
              <i>·</i>
              <strong>{palette.name}</strong>
            </span>
            <button className={styles.replayButton} onClick={celebrate}>
              <span aria-hidden="true">↻</span> 播放庆祝效果
            </button>
          </div>
        </div>
      </section>

      <section className={styles.scenarioSection} aria-labelledby="scenario-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionKicker}>REAL-WORLD MOMENTS</p>
            <h2 id="scenario-heading">先选一个成功时刻</h2>
          </div>
          <span className={styles.stepLabel}>01 <i /> 02</span>
        </div>
        <div className={styles.scenarioGrid}>
          {scenarios.map((item, index) => (
            <button
              className={`${styles.scenarioButton} ${
                scenarioId === item.id ? styles.scenarioActive : ""
              }`}
              key={item.id}
              onClick={() => {
                setScenarioId(item.id);
                celebrate();
              }}
              aria-pressed={scenarioId === item.id}
            >
              <span className={styles.scenarioIndex}>0{index + 1}</span>
              <ScenarioIcon icon={item.icon} />
              <span className={styles.scenarioText}>
                <strong>{item.label}</strong>
                <small>{item.title}</small>
              </span>
              <span className={styles.scenarioArrow} aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.effectsSection} aria-labelledby="effects-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionKicker}>CHOOSE YOUR CELEBRATION</p>
            <h2 id="effects-heading">庆祝不止彩纸一种方式</h2>
            <p className={styles.effectsDescription}>
              可同时选择多种演出，再调节物理参数；组合方式没有上限。
            </p>
          </div>
          <span className={styles.totalCount}>自由组合 · 即时预览</span>
        </div>

        <div className={styles.modeGrid}>
          {celebrationModes.map((item) => (
            <button
              key={item.id}
              className={`${styles.modeButton} ${
                modes.includes(item.id) ? styles.modeActive : ""
              }`}
              onClick={() => toggleMode(item.id)}
              aria-pressed={modes.includes(item.id)}
            >
              <span className={styles.modeIcon}>{item.icon}</span>
              <span className={styles.modeText}>
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
              <span className={styles.modeCheck}>{modes.includes(item.id) ? "✓" : "＋"}</span>
            </button>
          ))}
        </div>

        <div className={styles.palettePicker}>
          <div className={styles.subsectionHeading}>
            <span>彩纸配色</span>
            <small>{palette.name}</small>
          </div>
          <div className={styles.paletteGrid}>
            {palettes.map((item) => (
              <button
                key={item.id}
                className={`${styles.paletteButton} ${
                  paletteId === item.id ? styles.paletteActive : ""
                }`}
                onClick={() => {
                  setPaletteId(item.id);
                  setBurstKey((key) => key + 1);
                }}
                aria-label={`${item.name}配色`}
                aria-pressed={paletteId === item.id}
                title={item.name}
              >
                {item.colors.map((color) => (
                  <i key={color} style={{ "--swatch-color": color } as CSSProperties} />
                ))}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.customizer}>
          <div className={styles.physicsPanel}>
            <div className={styles.subsectionHeading}>
              <span>物理引擎 · 自定义参数</span>
              <span className={styles.physicsTools}>
                <small>调整后点击「播放庆祝效果」预览</small>
                <button
                  type="button"
                  onClick={() => setPhysics(defaultPhysics)}
                  className={styles.resetButton}
                >
                  恢复默认
                </button>
              </span>
            </div>
            <div className={styles.controlsGrid}>
              <label className={styles.rangeControl}>
                <span><span>粒子数量</span><output>{physics.count}</output></span>
                <input
                  type="range"
                  min="40"
                  max="500"
                  step="10"
                  value={physics.count}
                  onChange={(event) => setPhysicsValue("count", Number(event.target.value))}
                />
              </label>
              <label className={styles.rangeControl}>
                <span><span>发射速度</span><output>{physics.speed.toFixed(1)}×</output></span>
                <input
                  type="range"
                  min="0.4"
                  max="2.4"
                  step="0.1"
                  value={physics.speed}
                  onChange={(event) => setPhysicsValue("speed", Number(event.target.value))}
                />
              </label>
              <label className={styles.rangeControl}>
                <span><span>重力</span><output>{physics.gravity.toFixed(0)} px/s²</output></span>
                <input
                  type="range"
                  min="180"
                  max="1200"
                  step="20"
                  value={physics.gravity}
                  onChange={(event) => setPhysicsValue("gravity", Number(event.target.value))}
                />
              </label>
              <label className={styles.rangeControl}>
                <span><span>风力</span><output>{physics.wind === 0 ? "无风" : physics.wind > 0 ? `→ ${physics.wind} px/s²` : `← ${Math.abs(physics.wind)} px/s²`}</output></span>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  step="25"
                  value={physics.wind}
                  onChange={(event) => setPhysicsValue("wind", Number(event.target.value))}
                />
              </label>
              <label className={styles.rangeControl}>
                <span><span>空气阻力</span><output>{physics.drag.toFixed(3)}</output></span>
                <input
                  type="range"
                  min="0.96"
                  max="0.999"
                  step="0.001"
                  value={physics.drag}
                  onChange={(event) => setPhysicsValue("drag", Number(event.target.value))}
                />
              </label>
            </div>
          </div>

          <div className={styles.soundPanel}>
            <div className={styles.subsectionHeading}>
              <span>庆祝音效</span>
              <small>勾选即可试听</small>
            </div>
            <p className={styles.soundNote}>音量渐强后渐弱；勾选即可试听，庆祝时再次播放。</p>
            <div className={styles.soundOptions}>
              {([
                ["cheer", "🙌", "现场欢呼"],
                ["applause", "👏", "热烈掌声"],
                ["whistle", "🎉", "庆祝口哨"],
              ] as const).map(([id, icon, label]) => (
                <label className={styles.soundToggle} key={id}>
                  <input
                    type="checkbox"
                    checked={sounds[id]}
                    onChange={(event) => toggleSound(id, event.target.checked)}
                  />
                  <span className={styles.soundIcon}>{icon}</span>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {audioError && <p className={styles.audioError} role="status">{audioError}</p>}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <a href="#" className={styles.brand}>
          <span className={styles.brandSymbol}>✳</span>
          <span>好彩头</span>
        </a>
        <span>物理参数可调 · 演出自由组合 · 庆祝没有上限</span>
        <a
          className={styles.attribution}
          href="https://github.com/jdecked/twemoji"
          target="_blank"
          rel="noreferrer"
        >
          Illustrations: Twemoji
        </a>
        <a
          className={styles.attribution}
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY 4.0
        </a>
        <a
          className={styles.attribution}
          href="https://freesound.org/"
          target="_blank"
          rel="noreferrer"
        >
          Sound: Freesound CC0
        </a>
      </footer>
    </main>
  );
}
