interface Props {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export const COLORS = [
  // Classics
  "#FF4D6D", "#FF85A1", "#FFB3C1", "#FFC8DD",
  "#C9184A", "#A4133C", "#800F2F",
  // Nudes & neutrals
  "#F4A896", "#E8896A", "#C97B5A", "#A0614A",
  "#F5E6D3", "#EDD5C0", "#D4A88A",
  // Purples
  "#9B5DE5", "#C77DFF", "#E0AAFF", "#7B2D8B",
  // Blues
  "#4361EE", "#4CC9F0", "#7FD8F8", "#023E8A",
  // Greens
  "#2DC653", "#70E000", "#AACC00", "#1B4332",
  "#90E0EF", "#48CAE4",
  // Oranges & yellows
  "#FB5607", "#FF9F1C", "#FFBF69", "#F4D35E",
  // Darks & edgy
  "#000000", "#1A1A2E", "#4A0E8F", "#2D0A0A",
  // Whites & metallics
  "#FFFFFF", "#E8E8E8", "#C0C0C0", "#D4AF37",
  "#B8860B", "#CD7F32",
];

export default function ColorPalette({ selectedColor, onSelectColor }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onSelectColor(color)}
          className="rounded-full transition-transform active:scale-90"
          style={{
            width: 32,
            height: 32,
            background: color,
            border: selectedColor === color
              ? "3px solid var(--accent)"
              : "2px solid rgba(0,0,0,0.15)",
            boxShadow: selectedColor === color
              ? "0 0 0 2px white, 0 0 0 4px var(--accent)"
              : "0 2px 4px rgba(0,0,0,0.15)",
            transform: selectedColor === color ? "scale(1.2)" : "scale(1)",
            cursor: "pointer",
            minWidth: 32,
            minHeight: 32,
          }}
          title={color}
        />
      ))}
    </div>
  );
}
