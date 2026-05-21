import type { Metadata } from "next";

import { VideoEditorShell } from "@/components/video-editor/VideoEditorShell";

export const metadata: Metadata = {
  title: "Andres Video Studio",
  description:
    "Interfaz visual de Andres Video Studio para edición automatizada de vídeo.",
};

export default function VideoEditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <VideoEditorShell>{children}</VideoEditorShell>;
}
