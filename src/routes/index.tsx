import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Letter for You" },
      { name: "description", content: "A cute interactive letter — drag, open, and read." },
      { property: "og:title", content: "A Letter for You" },
      { property: "og:description", content: "A cute interactive letter — drag, open, and read." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Quicksand:wght@400;600&display=swap",
      },
    ],
  }),
  component: LetterPage,
});

type PageKey = "front" | "p1" | "p2" | "p3";

const pages: { key: PageKey; title: string; body: string }[] = [
  {
    key: "p1",
    title: "Hello, you ♡",
    body:
      "If this little envelope found its way to you, it's because the day deserved a soft thing. Take a breath. The world can wait one whole minute.",
  },
  {
    key: "p2",
    title: "A tiny reminder",
    body:
      "You are doing better than you think. The small kindnesses you've stitched into the week — they count. Every single one.",
  },
  {
    key: "p3",
    title: "Stay cozy ☁︎",
    body:
      "Drink the warm drink. Pet the soft animal. Send the silly text. Then close this letter, smile a little, and carry on, lovely human.",
  },
];

function LetterPage() {
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(0);

  // drag with physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const controls = useAnimationControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  const wiggleOnce = async () => {
    await controls.start({ rotate: [0, -2, 2, -1.5, 1.5, 0], transition: { duration: 0.7 } });
  };

  useEffect(() => {
    if (!opened) wiggleOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const clouds = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        top: `${10 + Math.random() * 70}%`,
        left: `${Math.random() * 90}%`,
        scale: 0.6 + Math.random() * 1.1,
        delay: Math.random() * 8,
        duration: 35 + Math.random() * 25,
      })),
    [],
  );
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 10,
        duration: 9 + Math.random() * 8,
        scale: 0.5 + Math.random() * 1.2,
      })),
    [],
  );

  return (
    <main className="relative min-h-screen overflow-hidden cute-sky">
      {/* Floating clouds */}
      {clouds.map((c) => (
        <motion.div
          key={c.id}
          className="cloud"
          style={{ top: c.top, left: c.left, width: 80, height: 28, scale: c.scale }}
          animate={{ x: ["-10vw", "110vw"] }}
          transition={{ duration: c.duration, repeat: Infinity, ease: "linear", delay: c.delay }}
        />
      ))}
      {/* Rising hearts */}
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="heart"
          style={{ left: h.left, bottom: -20, scale: h.scale }}
          animate={{ y: [-0, -800], opacity: [0, 0.9, 0], rotate: [-45, -30, -55] }}
          transition={{ duration: h.duration, repeat: Infinity, delay: h.delay, ease: "easeOut" }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 px-6 pt-8 text-center">
        <h1
          className="text-5xl md:text-6xl text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          a little letter for you
        </h1>
        <p className="mt-1 text-muted-foreground text-sm md:text-base">
          {opened ? "use the arrows to read · close to seal it back up" : "drag the envelope around · tap to open"}
        </p>
      </div>

      {/* Stage */}
      <div
        ref={constraintsRef}
        className="relative z-10 mx-auto mt-6 flex h-[70vh] w-full max-w-5xl items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="envelope"
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.35}
              dragTransition={{ bounceStiffness: 220, bounceDamping: 14 }}
              whileTap={{ scale: 0.97, cursor: "grabbing" }}
              whileHover={{ scale: 1.03 }}
              style={{ x, y, rotate }}
              animate={controls}
              onClick={() => setOpened(true)}
              initial={{ opacity: 0, y: 40 }}
              exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.25 } }}
              className="cursor-grab"
            >
              <Envelope />
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
              className="relative"
            >
              <LetterCard
                page={page}
                onPrev={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
                onClose={() => {
                  setPage(0);
                  setOpened(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* tiny grass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{
          background:
            "radial-gradient(60px 20px at 10% 100%, oklch(0.82 0.12 150) 60%, transparent 61%)," +
            "radial-gradient(80px 24px at 30% 100%, oklch(0.8 0.13 150) 60%, transparent 61%)," +
            "radial-gradient(70px 22px at 55% 100%, oklch(0.82 0.12 150) 60%, transparent 61%)," +
            "radial-gradient(90px 26px at 80% 100%, oklch(0.8 0.13 150) 60%, transparent 61%)," +
            "radial-gradient(60px 20px at 95% 100%, oklch(0.82 0.12 150) 60%, transparent 61%)",
        }}
      />
    </main>
  );
}

function Envelope() {
  return (
    <div className="relative" style={{ width: 360, height: 240 }}>
      {/* drop shadow */}
      <div
        className="absolute -bottom-6 left-1/2 h-6 w-72 -translate-x-1/2 rounded-[50%]"
        style={{ background: "oklch(0 0 0 / 0.18)", filter: "blur(10px)" }}
      />
      {/* body */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(180deg, var(--envelope) 0%, var(--envelope-shadow) 100%)",
          boxShadow:
            "inset 0 -8px 0 oklch(0 0 0 / 0.08), 0 20px 40px -20px oklch(0 0 0 / 0.35)",
        }}
      />
      {/* back flap triangle (peeking) */}
      <svg
        viewBox="0 0 360 240"
        className="absolute inset-0"
        style={{ filter: "drop-shadow(0 4px 6px oklch(0 0 0 / 0.15))" }}
      >
        <path
          d="M0,120 L180,20 L360,120 L360,240 L0,240 Z"
          fill="var(--envelope-flap)"
        />
        <path d="M0,120 L180,140 L360,120" fill="none" stroke="oklch(0 0 0 / 0.12)" strokeWidth="2" />
      </svg>
      {/* wax seal */}
      <div
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-2xl"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, oklch(0.7 0.2 22), var(--wax) 70%)",
          color: "oklch(0.98 0.02 80)",
          boxShadow:
            "inset 0 -3px 0 oklch(0 0 0 / 0.25), 0 6px 12px -4px oklch(0 0 0 / 0.4)",
          fontFamily: "var(--font-display)",
        }}
      >
        ♡
      </div>
      {/* cute face */}
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2 select-none">
        <div className="flex items-center gap-6 opacity-70">
          <span className="block h-1.5 w-1.5 rounded-full bg-foreground" />
          <span className="block h-1.5 w-1.5 rounded-full bg-foreground" />
        </div>
      </div>
      {/* hint */}
      <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-muted-foreground"
        style={{ fontFamily: "var(--font-display)", fontSize: 22 }}
      >
        ✿ tap to open ✿
      </div>
    </div>
  );
}

function LetterCard({
  page,
  onPrev,
  onNext,
  onClose,
}: {
  page: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const current = pages[page];
  return (
    <div className="relative">
      {/* envelope back behind paper */}
      <div
        className="absolute -inset-6 -z-10 rounded-3xl"
        style={{
          background: "linear-gradient(180deg, var(--envelope-flap), var(--envelope-shadow))",
          boxShadow: "0 30px 60px -30px oklch(0 0 0 / 0.4)",
        }}
      />
      <motion.article
        key={current.key}
        initial={{ rotateY: -25, opacity: 0, y: 20 }}
        animate={{ rotateY: 0, opacity: 1, y: 0 }}
        exit={{ rotateY: 25, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="paper-grain relative w-[88vw] max-w-[520px] rounded-2xl p-8 md:p-10"
        style={{
          background:
            "linear-gradient(180deg, var(--paper) 0%, oklch(0.96 0.03 80) 100%)",
          color: "var(--ink)",
          boxShadow:
            "0 1px 0 oklch(0 0 0 / 0.05), 0 25px 40px -20px oklch(0 0 0 / 0.35)",
          minHeight: 380,
        }}
      >
        <header className="mb-4 flex items-center justify-between">
          <span
            className="rounded-full px-3 py-1 text-xs"
            style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            page {page + 1} / {pages.length}
          </span>
          <button
            onClick={onClose}
            aria-label="Close letter"
            className="rounded-full px-3 py-1 text-sm transition hover:scale-105"
            style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
          >
            seal ✿
          </button>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h2
              className="mb-4 text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}
            >
              {current.title}
            </h2>
            <p
              className="text-2xl leading-relaxed md:text-[26px]"
              style={{ fontFamily: "var(--font-letter)" }}
            >
              {current.body}
            </p>
          </motion.div>
        </AnimatePresence>

        <footer className="mt-8 flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={page === 0}
            className="rounded-full px-4 py-2 text-sm font-semibold transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: "var(--muted)", color: "var(--foreground)" }}
          >
            ← prev
          </button>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
            with love
          </span>
          <button
            onClick={onNext}
            disabled={page === pages.length - 1}
            className="rounded-full px-4 py-2 text-sm font-semibold transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            next →
          </button>
        </footer>
      </motion.article>
    </div>
  );
}
