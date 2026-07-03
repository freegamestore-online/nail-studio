import { NailShape } from "../types";

interface Props {
  selected: NailShape;
  onSelect: (s: NailShape) => void;
}

const SHAPES: { value: NailShape; label: string }[] = [
  { value: "round", label: "Round" },
  { value: "square", label: "Square" },
  { value: "almond", label: "Almond" },
  { value: "coffin", label: "Coffin" },
  { value: "stiletto", label: "Stiletto" },
];

// Mini SVG preview for each shape
function ShapePreview({ shape }: { shape: NailShape }) {
  const w = 22;
  const h = 28;
  let path = "";
  const r = w / 2;

  switch (shape) {
    case "round":
      path = `M 0,${h} L 0,${r} Q ${r},0 ${w},${r} L ${w},${h} Z`;
      break;
    case "square":
      path = `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`;
      break;
    case "almond":
      path = `M 0,${h} L 0,${h * 0.4} Q ${r},0 ${w},${h * 0.4} L ${w},${h} Z`;
      break;
    case "coffin":
      path = `M ${w * 0.15},${h} L 0,${h * 0.35} L ${w * 0.25},0 L ${w * 0.75},0 L ${w},${h * 0.35} L ${w * 0.85},${h} Z`;
      break;
    case "stiletto":
      path = `M 0,${h} L 0,${h * 0.5} L ${r},0 L ${w},${h * 0.5} L ${w},${h} Z`;
      break;
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={path} fill="currentColor" />
    </svg>
  );
}

export default function ShapePicker({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap justify-center">
      {SHAPES.map((s) => (
        <button
          key={s.value}
          onClick={() => onSelect(s.value)}
          className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-all active:scale-95"
          style={{
            background: selected === s.value ? "var(--accent)" : "var(--surface)",
            border: `2px solid ${selected === s.value ? "var(--accent)" : "var(--border)"}`,
            color: selected === s.value ? "white" : "var(--muted)",
            minWidth: 48,
            minHeight: 52,
            cursor: "pointer",
          }}
          title={s.label}
        >
          <ShapePreview shape={s.value} />
          <span style={{ fontSize: 9, fontFamily: "Manrope, sans-serif", fontWeight: 600 }}>
            {s.label}
          </span>
        </button>
      ))}
    </div>
  );
}
