export type Status =
  | "BELUM_DIUMUMKAN"
  | "LOLOS"
  | "TIDAK_LOLOS"
  | "DAFTAR_TUNGGU"
  | "LOLOS_TAHAP_BERIKUTNYA"
  | "FINALIS"
  | "TERPILIH"
  | "TIDAK_TERPILIH";

export interface Participant {
  id: string;
  name: string;
  participant_number: string;
  class: string;
  status: Status;
  stage: string;
  message: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type StageStatus =
  | "AKAN_DATANG"
  | "BERLANGSUNG"
  | "SELESAI";

export interface SelectionStage {
  id: string;
  order_number: number;
  name: string;
  description: string | null;
  date: string | null;
  status: StageStatus;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}
