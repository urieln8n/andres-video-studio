import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#090909] px-5 text-zinc-100">
      <Link
        href="/video-editor"
        className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-7 text-base font-semibold text-zinc-950 shadow-[0_24px_90px_-36px_rgba(214,178,110,0.95)] transition hover:brightness-110"
      >
        Abrir Andres Video Studio
      </Link>
    </main>
  );
}
