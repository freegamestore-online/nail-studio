import { NailDecoration, NailShape, NailState } from "../types";

interface Props {
  nails: NailState[];
  shape: NailShape;
  hand: "left" | "right";
  selectedNails: Set<number>;
  onNailClick: (index: number, x: number, y: number) => void;
  baseOffset?: number; // finger index offset for left/right hands (always 0 for this layout)
}

const FINGER_LABELS = ["Thumb", "Index", "Middle", "Ring", "Pinky"];

// Nail bed dimensions per finger (relative units, will be scaled)
const FINGER_WIDTHS = [52, 40, 42, 38, 30];
const FINGER_HEIGHTS = [58, 72, 76, 70, 56];
const NAIL_HEIGHT_RATIO = 0.55; // nail takes up top 55% of finger height

// Decoration renderers
function renderDecoration(
  decoration: NailDecoration,
  color: string,
  w: number,
  h: number,
): React.ReactNode {
  if (decoration === "none") return null;

  if (decoration === "glitter") {
    const dots = Array.from({ length: 14 }, (_, i) => ({
      x: 10 + ((i * 17) % (w - 20)),
      y: 6 + ((i * 13) % (h - 10)),
      r: 1.5 + (i % 3),
    }));
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${w} ${h}`}
        style={{ pointerEvents: "none" }}
      >
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill="rgba(255,255,255,0.75)"
          />
        ))}
      </svg>
    );
  }

  if (decoration === "stars") {
    const positions = [
      { x: w * 0.25, y: h * 0.3 },
      { x: w * 0.7, y: h * 0.55 },
      { x: w * 0.5, y: h * 0.2 },
    ];
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
        {positions.map((p, i) => (
          <span
            key={i}
            className="absolute text-white"
            style={{ left: p.x, top: p.y, fontSize: 10 + (i % 2) * 2, transform: "translate(-50%,-50%)", textShadow: "0 0 4px rgba(0,0,0,0.3)" }}
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  if (decoration === "hearts") {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
        <span className="text-white" style={{ fontSize: 14, textShadow: "0 0 4px rgba(0,0,0,0.3)" }}>♥</span>
      </div>
    );
  }

  if (decoration === "flowers") {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
        <span className="text-white" style={{ fontSize: 14, textShadow: "0 0 4px rgba(0,0,0,0.3)" }}>✿</span>
      </div>
    );
  }

  if (decoration === "gems") {
    return (
      <div className="absolute inset-0 flex items-center justify-center gap-0.5" style={{ pointerEvents: "none" }}>
        {["💎", "💎"].map((g, i) => (
          <span key={i} style={{ fontSize: 8 }}>{g}</span>
        ))}
      </div>
    );
  }

  return null;
}

function getNailClipPath(shape: NailShape, w: number, h: number): string {
  // Returns SVG path for the nail shape
  const r = w / 2;
  switch (shape) {
    case "round":
      // Rounded top
      return `M 0,${h} L 0,${r} Q ${r},0 ${w},${r} L ${w},${h} Z`;
    case "square":
      return `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`;
    case "almond":
      // Pointed oval top
      return `M 0,${h} L 0,${h * 0.4} Q ${r},0 ${w},${h * 0.4} L ${w},${h} Z`;
    case "coffin":
      // Flat top, tapered sides
      return `M ${w * 0.15},${h} L 0,${h * 0.35} L ${w * 0.25},0 L ${w * 0.75},0 L ${w},${h * 0.35} L ${w * 0.85},${h} Z`;
    case "stiletto":
      // Very pointed
      return `M 0,${h} L 0,${h * 0.5} L ${r},0 L ${w},${h * 0.5} L ${w},${h} Z`;
    default:
      return `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`;
  }
}

export default function NailHand({ nails, shape, hand, onNailClick }: Props) {
  const isLeft = hand === "left";

  return (
    <div className="flex flex-col items-center select-none">
      {/* Palm base */}
      <div
        className="relative rounded-b-3xl"
        style={{
          background: "linear-gradient(180deg, #f5c5a3 0%, #e8a882 100%)",
          width: 180,
          height: 70,
          borderRadius: "0 0 40px 40px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {/* Palm highlight */}
        <div
          className="absolute inset-x-4 top-2"
          style={{
            height: 20,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 20,
          }}
        />
      </div>

      {/* Fingers */}
      <div
        className="flex items-end gap-1"
        style={{ flexDirection: isLeft ? "row" : "row-reverse" }}
      >
        {FINGER_WIDTHS.map((fw, i) => {
          const fh = FINGER_HEIGHTS[i];
          const nailH = Math.round(fh * NAIL_HEIGHT_RATIO);
          const nail = nails[i];
          const isPainted = nail?.painted;
          const nailColor = isPainted ? nail.color : "#f0e0d0";
          const clipId = `nail-clip-${hand}-${i}`;
          const nailPath = getNailClipPath(shape, fw, nailH);

          return (
            <div key={i} className="flex flex-col items-center" style={{ width: fw }}>
              {/* Nail */}
              <div
                className="relative cursor-pointer"
                style={{ width: fw, height: nailH, marginBottom: -2 }}
                onClick={(e) => {
                  const rect = (e.target as HTMLElement).closest('[data-nail]')?.getBoundingClientRect();
                  onNailClick(i, e.clientX, e.clientY);
                  e.stopPropagation();
                }}
                data-nail="true"
                title={FINGER_LABELS[i]}
              >
                <svg
                  width={fw}
                  height={nailH}
                  viewBox={`0 0 ${fw} ${nailH}`}
                  style={{ display: "block", filter: isPainted ? "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" : "none" }}
                >
                  <defs>
                    <clipPath id={clipId}>
                      <path d={nailPath} />
                    </clipPath>
                    <linearGradient id={`shine-${hand}-${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  {/* Nail base */}
                  <path d={nailPath} fill={nailColor} />
                  {/* Shine overlay */}
                  <path d={nailPath} fill={`url(#shine-${hand}-${i})`} />
                  {/* Border */}
                  <path
                    d={nailPath}
                    fill="none"
                    stroke={isPainted ? "rgba(0,0,0,0.15)" : "#d4b8a8"}
                    strokeWidth={1.5}
                  />
                </svg>

                {/* Decoration layer */}
                {isPainted && nail.decoration !== "none" && (
                  <div
                    className="absolute inset-0"
                    style={{ clipPath: `path('${nailPath}')` }}
                  >
                    {renderDecoration(nail.decoration, nail.color, fw, nailH)}
                  </div>
                )}
              </div>

              {/* Finger */}
              <div
                style={{
                  width: fw,
                  height: fh - nailH,
                  background: "linear-gradient(180deg, #f5c5a3 0%, #e8a882 100%)",
                  borderRadius: `0 0 ${fw / 2}px ${fw / 2}px`,
                  boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                {/* Knuckle line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "30%",
                    left: "15%",
                    right: "15%",
                    height: 1,
                    background: "rgba(0,0,0,0.08)",
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
