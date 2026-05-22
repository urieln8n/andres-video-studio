import type { ReactNode } from "react";

import type { VideoEditorOutputFormat } from "@/lib/video-editor/types";

const formatLabels: Record<VideoEditorOutputFormat, string> = {
  horizontal_16_9: "16:9",
  square_1_1: "1:1",
  vertical_9_16: "9:16",
};

export function PreviewDeviceFrame({
  children,
  outputFormat,
}: {
  children: ReactNode;
  outputFormat: VideoEditorOutputFormat;
}) {
  const shape =
    outputFormat === "vertical_9_16"
      ? "mx-auto aspect-[9/16] w-full max-w-[21rem] rounded-[28px] p-2"
      : outputFormat === "square_1_1"
        ? "mx-auto aspect-square w-full max-w-[29rem] rounded-[18px] p-2"
        : "aspect-video w-full rounded-[18px] p-2";

  return (
    <div className="rounded-[8px] border border-white/[0.08] bg-black/25 p-3">
      <div
        className={`${shape} border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.035))] shadow-[0_34px_100px_-42px_rgba(0,0,0,1)]`}
      >
        <div className="relative h-full overflow-hidden rounded-[inherit] border border-black/40 bg-zinc-950">
          {children}
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-semibold uppercase text-zinc-500">
        Formato {formatLabels[outputFormat]}
      </p>
    </div>
  );
}
