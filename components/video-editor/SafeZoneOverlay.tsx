import type {
  VideoEditorOutputFormat,
  VideoEditorSafeZone,
} from "@/lib/video-editor/types";

const previewDimensions: Record<
  VideoEditorOutputFormat,
  { height: number; width: number }
> = {
  horizontal_16_9: { height: 1080, width: 1920 },
  square_1_1: { height: 1080, width: 1080 },
  vertical_9_16: { height: 1920, width: 1080 },
};

export function SafeZoneOverlay({
  outputFormat,
  safeZone,
}: {
  outputFormat: VideoEditorOutputFormat;
  safeZone: VideoEditorSafeZone;
}) {
  const { height, width } = previewDimensions[outputFormat];
  const top = toPercent(safeZone.top, height);
  const bottom = toPercent(safeZone.bottom, height);
  const left = toPercent(safeZone.left, width);
  const right = toPercent(safeZone.right, width);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      <div
        className="absolute inset-x-0 top-0 border-b border-dashed border-[#efd8ad]/20 bg-[#efd8ad]/[0.035]"
        style={{ height: `${top}%` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 border-t border-dashed border-[#efd8ad]/20 bg-black/20"
        style={{ height: `${bottom}%` }}
      />
      <div
        className="absolute border border-dashed border-white/[0.16]"
        style={{
          bottom: `${bottom}%`,
          left: `${left}%`,
          right: `${right}%`,
          top: `${top}%`,
        }}
      />
      <span className="absolute left-3 top-3 rounded-[8px] border border-white/10 bg-black/35 px-2 py-1 text-[10px] font-medium uppercase text-white/55 backdrop-blur">
        Safe zone
      </span>
    </div>
  );
}

function toPercent(value: number, total: number) {
  return Math.min(46, Math.max(0, (value / total) * 100));
}
