import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, GameTopbar } from "@freegamestore/games";
import NailHand from "./components/NailHand";
import ColorPalette, { COLORS } from "./components/ColorPalette";
import DecorationPicker from "./components/DecorationPicker";
import ShapePicker from "./components/ShapePicker";
import { useHighScore } from "./hooks/useHighScore";
import type { NailDecoration, NailShape, NailState, Sparkle } from "./types";

const TOTAL_NAILS = 10; // 5 per hand

function makeEmptyNails(): NailState[] {
  return Array.from({ length: TOTAL_NAILS }, () => ({
    color: "#FF4D6D",
    decoration: "none" as NailDecoration,
    painted: false,
  }));
}

let sparkleIdCounter = 0;

function createSparkles(x: number, y: number, color: string): Sparkle[] {
  return Array.from({ length: 12 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 80;
    return {
      id: ++sparkleIdCounter,
      x,
      y,
      color,
      life: 1,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
    };
  });
}

type Tab = "color" | "shape" | "decor";

export default function App() {
  const [nails, setNails] = useState<NailState[]>(makeEmptyNails);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [selectedDecoration, setSelectedDecoration] = useState<NailDecoration>("none");
  const [selectedShape, setSelectedShape] = useState<NailShape>("round");
  const [score, setScore] = useState(0);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [tab, setTab] = useState<Tab>("color");
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [highScore, updateHighScore] = useHighScore("nailpainting_highscore");
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const sparklesRef = useRef<Sparkle[]>([]);

  // Sparkle animation loop
  useEffect(() => {
    function loop(now: number) {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      sparklesRef.current = sparklesRef.current
        .map((s) => ({
          ...s,
          x: s.x + s.vx * dt,
          y: s.y + s.vy * dt,
          vy: s.vy + 120 * dt,
          life: s.life - dt * 1.8,
        }))
        .filter((s) => s.life > 0);

      setSparkles([...sparklesRef.current]);
      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const paintedCount = nails.filter((n) => n.painted).length;
  const allPainted = paintedCount === TOTAL_NAILS;

  const handleNailClick = useCallback(
    (absoluteIndex: number, x: number, y: number) => {
      setNails((prev) => {
        const updated = [...prev];
        const nail = updated[absoluteIndex];
        const wasPainted = nail.painted;

        updated[absoluteIndex] = {
          color: selectedColor,
          decoration: selectedDecoration,
          painted: true,
        };

        // Score: +10 for first paint, +5 for repaint
        const points = wasPainted ? 5 : 10;
        setScore((s) => {
          const next = s + points;
          updateHighScore(next);
          return next;
        });

        // Sparkles
        const newSparkles = createSparkles(x, y, selectedColor);
        sparklesRef.current = [...sparklesRef.current, ...newSparkles];

        // Check if all painted
        const newPainted = updated.filter((n) => n.painted).length;
        if (newPainted === TOTAL_NAILS && !wasPainted) {
          setTimeout(() => {
            setCelebrationMsg("💅 Gorgeous! All nails done!");
            setTimeout(() => setCelebrationMsg(null), 2500);
          }, 100);
          // Bonus sparkles across screen
          const bonusSparkles: Sparkle[] = [];
          for (let i = 0; i < 5; i++) {
            bonusSparkles.push(
              ...createSparkles(
                100 + Math.random() * (window.innerWidth - 200),
                100 + Math.random() * 200,
                COLORS[Math.floor(Math.random() * COLORS.length)],
              ),
            );
          }
          sparklesRef.current = [...sparklesRef.current, ...bonusSparkles];
        }

        return updated;
      });
    },
    [selectedColor, selectedDecoration, updateHighScore],
  );

  const handleReset = useCallback(() => {
    setNails(makeEmptyNails());
    setScore(0);
    setCelebrationMsg(null);
  }, []);

  const handleFillAll = useCallback(() => {
    setNails((prev) =>
      prev.map(() => ({
        color: selectedColor,
        decoration: selectedDecoration,
        painted: true,
      })),
    );
    const points = TOTAL_NAILS * 8;
    setScore((s) => {
      const next = s + points;
      updateHighScore(next);
      return next;
    });
    // Celebration
    for (let i = 0; i < 6; i++) {
      const newSparkles = createSparkles(
        100 + Math.random() * (window.innerWidth - 200),
        80 + Math.random() * 150,
        COLORS[Math.floor(Math.random() * COLORS.length)],
      );
      sparklesRef.current = [...sparklesRef.current, ...newSparkles];
    }
    setCelebrationMsg("💅 Stunning! All nails painted!");
    setTimeout(() => setCelebrationMsg(null), 2500);
  }, [selectedColor, selectedDecoration, updateHighScore]);

  return (
    <GameShell topbar={<GameTopbar title="Nail Studio" score={score} />}>
      {/* Sparkle overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 100 }}
        aria-hidden="true"
      >
        {sparkles.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: s.x - s.size / 2,
              top: s.y - s.size / 2,
              width: s.size,
              height: s.size,
              background: s.color,
              opacity: s.life,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
              transform: `scale(${s.life})`,
            }}
          />
        ))}
      </div>

      {/* Celebration banner */}
      {celebrationMsg && (
        <div
          className="fixed top-20 left-0 right-0 flex justify-center pointer-events-none"
          style={{ zIndex: 200 }}
        >
          <div
            className="px-6 py-3 rounded-2xl text-white font-bold text-lg shadow-xl"
            style={{
              fontFamily: "Fraunces, serif",
              background: "linear-gradient(135deg, #FF4D6D, #9B5DE5)",
              animation: "fadeInUp 0.3s ease",
            }}
          >
            {celebrationMsg}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ background: "var(--paper)" }}
      >
        {/* Hands area */}
        <div
          className="flex-1 flex items-center justify-center gap-4 px-2 py-2 min-h-0"
          style={{ overflow: "hidden" }}
        >
          <div className="flex gap-6 items-end scale-[0.85] sm:scale-100 origin-bottom">
            {/* Left hand */}
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--muted)", fontFamily: "Manrope, sans-serif" }}
              >
                Left Hand
              </span>
              <NailHand
                nails={nails.slice(0, 5)}
                shape={selectedShape}
                hand="left"
                selectedNails={new Set()}
                onNailClick={(i, x, y) => handleNailClick(i, x, y)}
              />
            </div>

            {/* Right hand */}
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--muted)", fontFamily: "Manrope, sans-serif" }}
              >
                Right Hand
              </span>
              <NailHand
                nails={nails.slice(5, 10)}
                shape={selectedShape}
                hand="right"
                selectedNails={new Set()}
                onNailClick={(i, x, y) => handleNailClick(i + 5, x, y)}
              />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-1">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "Manrope" }}>
              {paintedCount}/{TOTAL_NAILS} nails
            </span>
            <div
              className="flex-1 rounded-full overflow-hidden"
              style={{ height: 8, background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(paintedCount / TOTAL_NAILS) * 100}%`,
                  background: "linear-gradient(90deg, #FF4D6D, #9B5DE5)",
                }}
              />
            </div>
            <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "Manrope" }}>
              Best: {highScore}
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div
          className="flex-shrink-0 rounded-t-3xl shadow-xl px-3 pt-3 pb-2"
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            maxHeight: "52%",
          }}
        >
          {/* Tab bar */}
          <div className="flex gap-1 mb-3 rounded-xl p-1" style={{ background: "var(--paper)" }}>
            {(
              [
                { id: "color" as Tab, label: "🎨 Colors" },
                { id: "shape" as Tab, label: "💅 Shape" },
                { id: "decor" as Tab, label: "✨ Decor" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  background: tab === id ? "var(--accent)" : "transparent",
                  color: tab === id ? "white" : "var(--muted)",
                  border: "none",
                  cursor: "pointer",
                  minHeight: 36,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="overflow-y-auto" style={{ maxHeight: 140 }}>
            {tab === "color" && (
              <ColorPalette
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
              />
            )}
            {tab === "shape" && (
              <ShapePicker
                selected={selectedShape}
                onSelect={setSelectedShape}
              />
            )}
            {tab === "decor" && (
              <DecorationPicker
                selected={selectedDecoration}
                onSelect={setSelectedDecoration}
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleFillAll}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
              style={{
                fontFamily: "Manrope, sans-serif",
                background: allPainted
                  ? "var(--border)"
                  : "linear-gradient(135deg, #FF4D6D, #9B5DE5)",
                color: "white",
                border: "none",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              💅 Paint All
            </button>
            <button
              onClick={handleReset}
              className="py-2.5 px-4 rounded-xl font-bold text-sm transition-all active:scale-95"
              style={{
                fontFamily: "Manrope, sans-serif",
                background: "var(--paper)",
                color: "var(--muted)",
                border: "2px solid var(--border)",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              🗑 Reset
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </GameShell>
  );
}
