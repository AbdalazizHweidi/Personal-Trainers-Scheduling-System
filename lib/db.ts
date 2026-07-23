export type Trainer = {
  id: number;
  full_name: string;
  specialties: string[] | null;
  bio: string | null;
  certifications: string | null;
  photo_url: string | null;
  avg_rating: number | null;
  is_active: boolean;
  deleted_at: string | null;
};

export type Service = {
  id: number;
  trainer_id: number;
  name: string;
  type: "1-on-1" | "group" | "online";
  duration_minutes: number;
  price: number;
  is_active: boolean;
  deleted_at: string | null;
};

export type AvailabilitySlot = {
  id: number;
  trainer_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: "open" | "blocked" | "booked";
  is_recurring: boolean;
  deleted_at: string | null;
};

export type Review = {
  id: number;
  booking_id: number;
  client_id: number;
  trainer_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  deleted_at: string | null;
};