import argparse
import json
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe Andres Video Studio WAV audio with faster-whisper."
    )
    parser.add_argument("--audio", required=True, help="Input WAV audio path.")
    parser.add_argument("--out", required=True, help="Output transcript JSON path.")
    parser.add_argument("--model", default="small", help="Whisper model size.")
    parser.add_argument(
        "--language",
        default=None,
        help="Optional source language code. Omit it for detection.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    audio_path = Path(args.audio)
    out_path = Path(args.out)

    if not audio_path.is_file():
        print(f"Audio WAV not found: {audio_path}", file=sys.stderr)
        return 2

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(
            "faster-whisper is not installed. Install it in a local venv with "
            "`python -m venv .venv` and `pip install faster-whisper`.",
            file=sys.stderr,
        )
        return 3

    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    language = args.language.strip() if args.language else None
    segments, info = model.transcribe(
        str(audio_path),
        language=language,
        vad_filter=True,
        word_timestamps=True,
    )

    transcript_segments = []
    full_text_parts = []

    for segment in segments:
        text = segment.text.strip()

        if not text:
            continue

        transcript_words = []

        for word in getattr(segment, "words", []) or []:
            word_text = getattr(word, "word", "").strip()
            word_start = getattr(word, "start", None)
            word_end = getattr(word, "end", None)

            if (
                not word_text
                or word_start is None
                or word_end is None
                or word_end <= word_start
            ):
                continue

            transcript_words.append(
                {
                    "start": float(word_start),
                    "end": float(word_end),
                    "word": word_text,
                }
            )

        transcript_segment = {
            "start": float(segment.start),
            "end": float(segment.end),
            "text": text,
        }

        if transcript_words:
            transcript_segment["words"] = transcript_words

        transcript_segments.append(transcript_segment)
        full_text_parts.append(text)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "language": getattr(info, "language", None) or language,
        "duration": getattr(info, "duration", None),
        "text": " ".join(full_text_parts).strip(),
        "segments": transcript_segments,
    }
    out_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
