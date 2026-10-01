"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Category = "里程碑" | "轻量" | "商务";

type Celebration = {
  id: number;
  name: string;
  category: Category;
  title: string;
  description: string;
  icon: string;
  theme: string;
  tag: string;
};

const celebrations: Celebration[] = [
  {
    id: 1,
    name: "星光时刻",
    category: "里程碑",
    title: "太棒了，目标达成！",
    description: "每一个闪光时刻，都值得被好好记录。",
    icon: "✦",
    theme: "starlight",
    tag: "目标达成",
  },
  {
    id: 2,
    name: "金色奖章",
    category: "里程碑",
    title: "冠军属于你！",
    description: "全力以赴的你，值得这份闪耀。",
    icon: "♛",
    theme: "gold",
    tag: "荣耀时刻",
  },
  {
    id: 3,
    name: "轻盈气泡",
    category: "轻量",
    title: "搞定啦！",
    description: "小小一步，也是了不起的进步。",
    icon: "✓",
    theme: "mint",
    tag: "任务完成",
  },
  {
    id: 4,
    name: "彩带派对",
    category: "里程碑",
    title: "值得大声说恭喜！",
    description: "庆祝努力，也庆祝新的开始。",
    icon: "🎉",
    theme: "party",
    tag: "好消息",
  },
  {
    id: 5,
    name: "紫色新篇",
    category: "轻量",
    title: "解锁新成就",
    description: "你的坚持，正在变成新的可能。",
    icon: "↗",
    theme: "violet",
    tag: "新成就",
  },
  {
    id: 6,
    name: "温柔鼓励",
    category: "轻量",
    title: "你已经做得很好了",
    description: "给努力的自己，一个真诚的赞。",
    icon: "♡",
    theme: "peach",
    tag: "为自己喝彩",
  },
  {
    id: 7,
    name: "商务捷报",
    category: "商务",
    title: "合作圆满成功",
    description: "感谢携手同行，期待下一次共赢。",
    icon: "↗",
    theme: "navy",
    tag: "合作达成",
  },
  {
    id: 8,
    name: "数字里程碑",
    category: "商务",
    title: "100,000 位用户",
    description: "每一份信任，都是我们前进的动力。",
    icon: "100K",
    theme: "blue",
    tag: "重要里程碑",
  },
  {
    id: 9,
    name: "花漾祝福",
    category: "里程碑",
    title: "新的旅程，闪闪发光",
    description: "愿热爱与好消息，一直伴你左右。",
    icon: "✿",
    theme: "flower",
    tag: "美好祝愿",
  },
  {
    id: 10,
    name: "极简勋章",
    category: "商务",
    title: "项目顺利交付",
    description: "专业、专注，每一步都算数。",
    icon: "✓",
    theme: "minimal",
    tag: "项目完成",
  },
];

const filters = ["全部", "里程碑", "轻量", "商务"] as const;
const confettiEmojis = ["🎉", "✨", "🎊", "🌸", "🎈", "💐", "🥳", "🌟", "🎉", "🎊", "🌼", "✨"];

function CelebrationCard({
  celebration,
  selected,
  onSelect,
  onCopy,
}: {
  celebration: Celebration;
  selected: boolean;
  onSelect: () => void;
  onCopy: () => void;
}) {
  return (
    <article
      className={`${styles.card} ${styles[celebration.theme]} ${
        selected ? styles.selected : ""
      }`}
    >
      <div className={styles.cardTopline}>
        <span className={styles.cardTag}>{celebration.tag}</span>
        <span className={styles.cardNumber}>
          {String(celebration.id).padStart(2, "0")}
        </span>
      </div>
      <div className={styles.artwork} aria-hidden="true">
        <span className={styles.artworkHalo} />
        <span className={styles.artworkMark}>{celebration.icon}</span>
        <span className={styles.artworkSparkle}>✦</span>
      </div>
      <div className={styles.cardCopy}>
        <p className={styles.cardName}>{celebration.name}</p>
        <h3>{celebration.title}</h3>
        <p className={styles.cardDescription}>{celebration.description}</p>
      </div>
      <div className={styles.cardActions}>
        <button className={styles.selectButton} onClick={onSelect}>
          {selected ? "已选中" : "选择组件"}
          <span aria-hidden="true">{selected ? "✓" : "↗"}</span>
        </button>
        <button
          className={styles.copyButton}
          onClick={onCopy}
          aria-label={`复制「${celebration.name}」的祝贺文案`}
          title="复制祝贺文案"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={styles.copyIcon}
          >
            <rect x="7" y="6" width="9" height="11" rx="2" />
            <path d="M12 6V4.75A1.75 1.75 0 0 0 10.25 3h-5.5A1.75 1.75 0 0 0 3 4.75v7.5A1.75 1.75 0 0 0 4.75 14H7" />
          </svg>
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("全部");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [confettiBurst, setConfettiBurst] = useState(0);

  useEffect(() => {
    if (confettiBurst === 0) return;

    const timeout = window.setTimeout(() => setConfettiBurst(0), 2800);
    return () => window.clearTimeout(timeout);
  }, [confettiBurst]);

  const visibleCelebrations =
    activeFilter === "全部"
      ? celebrations
      : celebrations.filter((celebration) => celebration.category === activeFilter);

  async function copyMessage(celebration: Celebration) {
    try {
      await navigator.clipboard.writeText(
        `${celebration.title} ${celebration.description}`,
      );
      setNotice(`「${celebration.name}」文案已复制`);
      window.setTimeout(() => setNotice(""), 2400);
    } catch {
      setNotice("复制失败，请检查浏览器剪贴板权限");
      window.setTimeout(() => setNotice(""), 3000);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="#" className={styles.brand} aria-label="恭喜首页">
          <span className={styles.brandMark}>c.</span>
          <span>恭喜</span>
        </a>
        <nav className={styles.navigation} aria-label="主导航">
          <a href="#gallery" className={styles.navLink}>
            组件灵感
          </a>
          <a href="#about" className={styles.navLink}>
            关于恭喜
          </a>
        </nav>
        <a href="#gallery" className={styles.headerButton}>
          挑选组件 <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className={styles.hero} id="about">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            GOOD THINGS DESERVE A CELEBRATION
          </p>
          <h1>
            把每一次成功，
            <br />
            都认真<span>庆祝。</span>
          </h1>
          <p className={styles.heroDescription}>
            从小小的任务完成，到值得铭记的重要时刻。
            <br />
            用一份恰到好处的祝贺，让好消息更有温度。
          </p>
          <div className={styles.heroActions}>
            <a href="#gallery" className={styles.primaryButton}>
              探索 10 款组件 <span aria-hidden="true">↓</span>
            </a>
            <span className={styles.heroNote}>免费使用 · 即选即用</span>
          </div>
          <div className={styles.heroFootnote}>
            <span>01 — 10</span>
            <span>为每个值得庆祝的瞬间而设计</span>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="成功庆祝卡片预览">
          <div className={styles.visualOrb} />
          <div className={styles.visualConfetti}>
            <i>✳</i>
            <i>✦</i>
            <i>＋</i>
            <i>✳</i>
          </div>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewBadge}>特别时刻</span>
              <span className={styles.previewDots}>···</span>
            </div>
            <div className={styles.previewMedal}>
              <span>✦</span>
              <i />
            </div>
            <p className={styles.previewOverline}>YOU DID IT</p>
            <h2>目标达成！</h2>
            <p className={styles.previewText}>所有努力，终于开花结果。</p>
            <div className={styles.previewFooter}>
              <span>为你感到骄傲</span>
              <span className={styles.previewHeart}>♥</span>
            </div>
          </div>
          <div className={styles.floatingNote}>
            <span className={styles.floatingCheck}>✓</span>
            <span>
              <strong>值得庆祝</strong>
              <small>每一个小小的成功</small>
            </span>
          </div>
          <div className={styles.visualIndex}>
            <span>精选组件</span>
            <strong>01</strong>
            <span className={styles.indexLine} />
            <span>10</span>
          </div>
        </div>
      </section>

      <section className={styles.gallery} id="gallery">
        <div className={styles.galleryHeading}>
          <div>
            <p className={styles.sectionEyebrow}>THE CELEBRATION COLLECTION</p>
            <h2>找到你的庆祝方式<span>。</span></h2>
            <p className={styles.sectionDescription}>
              10 款精心设计的成功组件，为每一种好消息准备。
            </p>
          </div>
          <span className={styles.collectionCount}>
            <strong>{String(visibleCelebrations.length).padStart(2, "0")}</strong>
            <span>款组件</span>
          </span>
        </div>

        <div className={styles.galleryToolbar}>
          <div className={styles.filters} role="group" aria-label="筛选组件">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`${styles.filterButton} ${
                  activeFilter === filter ? styles.activeFilter : ""
                }`}
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
              >
                {filter}
              </button>
            ))}
          </div>
          <span className={styles.toolbarHint}>
            选择一款，传递你的好消息 <span aria-hidden="true">↙</span>
          </span>
        </div>

        <div className={styles.cardGrid}>
          {visibleCelebrations.map((celebration) => (
            <CelebrationCard
              key={celebration.id}
              celebration={celebration}
              selected={selectedId === celebration.id}
              onSelect={() => {
                setSelectedId(celebration.id);
                setConfettiBurst((burst) => burst + 1);
                setNotice(`已选择「${celebration.name}」`);
                window.setTimeout(() => setNotice(""), 2400);
              }}
              onCopy={() => void copyMessage(celebration)}
            />
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <a href="#" className={styles.brand}>
          <span className={styles.brandMark}>c.</span>
          <span>恭喜</span>
        </a>
        <p>好消息，值得被认真对待。</p>
        <span className={styles.footerCopyright}>MADE FOR YOUR MOMENTS · 2025</span>
      </footer>

      {notice && (
        <div className={styles.toast} role="status">
          <span>✓</span> {notice}
        </div>
      )}
      {confettiBurst > 0 && (
        <div key={confettiBurst} className={styles.confettiLayer} aria-hidden="true">
          {confettiEmojis.map((emoji, index) => (
            <span className={styles.confettiPiece} key={`${emoji}-${index}`}>
              {emoji}
            </span>
          ))}
        </div>
      )}
    </main>
  );
}
