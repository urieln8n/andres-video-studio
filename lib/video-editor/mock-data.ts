export type VideoFeature = {
  number: string;
  title: string;
  description: string;
};

export type ProcessingPhase = {
  step: string;
  label: string;
  status: "completed" | "current" | "upcoming";
};

export type LiveLog = {
  time: string;
  message: string;
  active?: boolean;
};

export type ProcessingStatus = {
  eta: string;
  message: string;
  progress: number;
};

export type VideoDetail = {
  label: string;
  value: string;
};

export const videoFeatures: VideoFeature[] = [
  {
    number: "01",
    title: "Transcribe",
    description: "audio a texto con precisión",
  },
  {
    number: "02",
    title: "Recorta",
    description: "silencios, pausas y fillers",
  },
  {
    number: "03",
    title: "Anima",
    description: "subtítulos y motion graphics",
  },
  {
    number: "04",
    title: "Renderiza",
    description: "exportación lista para redes",
  },
];

export const processingStatus: ProcessingStatus = {
  eta: "44s",
  message: "Renderizando overlays HTML a ProRes 4444",
  progress: 68,
};

export const processingPhases: ProcessingPhase[] = [
  {
    step: "1",
    label: "Análisis del vídeo",
    status: "completed",
  },
  {
    step: "2",
    label: "Transcripción audio",
    status: "completed",
  },
  {
    step: "3",
    label: "Recorte de fillers",
    status: "completed",
  },
  {
    step: "4",
    label: "Diseño de motion graphics",
    status: "completed",
  },
  {
    step: "5",
    label: "Renderizando overlays",
    status: "current",
  },
  {
    step: "6",
    label: "Compositing final",
    status: "upcoming",
  },
  {
    step: "7",
    label: "Entregando",
    status: "upcoming",
  },
];

export const liveProcessingLogs: LiveLog[] = [
  {
    time: "00:01",
    message: "Subiendo vídeo...",
  },
  {
    time: "00:04",
    message: "Vídeo en input detectado",
  },
  {
    time: "00:09",
    message: "Analizando vídeo y preparando entorno",
  },
  {
    time: "00:18",
    message: "Transcribiendo audio",
  },
  {
    time: "00:31",
    message: "Detectando fillers y cortes",
  },
  {
    time: "00:39",
    message: "Diseñando motion graphics",
  },
  {
    time: "00:52",
    message: "Renderizando overlays HTML",
    active: true,
  },
];

export const resultDetails: VideoDetail[] = [
  {
    label: "Archivo",
    value: "sin_titulo_final.mp4",
  },
  {
    label: "Tiempo total",
    value: "1:02",
  },
  {
    label: "Guardado en",
    value: "/output",
  },
  {
    label: "Formato",
    value: "9:16",
  },
  {
    label: "Estado",
    value: "completado",
  },
];
