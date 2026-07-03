import { NailDecoration } from "../types";

interface Props {
  selected: NailDecoration;
  onSelect: (d: NailDecoration) => void;
}

const DECORATIONS: { value: NailDecoration; label: string; emoji: string }[] = [
  { value: "none", label: "Plain", emoji: "✖" },
  { value: "glitter", label: "Glitter", emoji: "✨" },
  { value: "stars", label: "Stars", emoji: "⭐" },
  { value: "hearts", label: "Hearts", emoji: "♥" },
  { value: "flowers", label: "Flowers", emoji: "✿" },
  { value: "gems", label: "Gems", emoji: "💎" },
];

export default function DecorationPicker({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {DECORATIONS.map((d) => (
        <button
          key={d.value}
          onClick={() => onSelect(d.value)}
          className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all active:scale-95"
          style={{
            background: selected === d.value ? "var(--accent)" : "var(--surface)",
            border: `2px solid ${selected === d.value ? "var(--accent)" : "var(--border)"}`,
            color: selected === d.value ? "white" : "var(--ink)",
            minWidth: 44,
            minHeight: 44,
            cursor: "pointer",
            fontSize: 20,
          }}
          title={d.label}
        >
          <span>{d.emoji}</span>
          <span style={{ fontSize: 9, fontFamily: "Manrope, sans-serif", fontWeight: 600 }}>
            {d.label}
          </span>
        </button>
      ))}
    </div>
  );
}
