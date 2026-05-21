import { processVideoEditorJob } from "@/lib/video-editor/ffmpeg-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  try {
    const job = await processVideoEditorJob(jobId);

    if (!job) {
      return Response.json({ error: "Job no encontrado." }, { status: 404 });
    }

    return Response.json({ job });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo procesar el vídeo con FFmpeg.",
      },
      { status: 500 },
    );
  }
}
