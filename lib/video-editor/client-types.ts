export type VideoEditorClientSector =
  | "barberia"
  | "fotografia"
  | "restaurante"
  | "clinica"
  | "agencia"
  | "negocio_local"
  | "otro";

export type VideoEditorClient = {
  id: string;
  name: string;
  businessName: string;
  sector: VideoEditorClientSector;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  bookingUrl?: string;
  brandColor?: string;
  logoPath?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type VideoEditorClientSnapshot = {
  id: string;
  businessName: string;
  sector: VideoEditorClientSector;
  website: string | null;
  instagram: string | null;
  bookingUrl: string | null;
  brandColor: string | null;
};
