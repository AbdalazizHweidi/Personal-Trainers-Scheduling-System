export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: "client" | "admin"
  phone: string | null
  profile_photo_url: string | null
  created_at: string
}

export type Trainer = {
  id: number
  full_name: string
  specialties: string[]
  category: string | null
  bio: string | null
  certifications: string[]
  photo_url: string | null
  initials: string | null
  color: string | null
  avg_rating: number
  review_count: number
  is_active: boolean
  created_at: string
}

export type ServiceType = "1-on-1" | "group" | "online"

export type Service = {
  id: number
  trainer_id: number
  name: string
  type: ServiceType
  duration_minutes: number
  price: number
  description: string | null
  is_active: boolean
}

export type SlotStatus = "open" | "blocked" | "booked"

export type AvailabilitySlot = {
  id: number
  trainer_id: number
  slot_date: string
  start_time: string
  end_time: string
  status: SlotStatus
  is_recurring: boolean
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"

export type Booking = {
  id: number
  client_id: string
  trainer_id: number
  service_id: number | null
  slot_id: number | null
  session_date: string
  start_time: string
  end_time: string | null
  status: BookingStatus
  created_at: string
}

export type BookingWithDetails = Booking & {
  trainers: Pick<Trainer, "id" | "full_name" | "initials" | "color" | "category"> | null
  services: Pick<Service, "id" | "name" | "type" | "price" | "duration_minutes"> | null
  payments: Payment[] | null
}

export type Payment = {
  id: number
  booking_id: number
  amount: number
  cardholder_name: string | null
  card_last4: string | null
  status: "success" | "failed"
  paid_at: string
}

export type Review = {
  id: number
  booking_id: number | null
  client_id: string
  trainer_id: number
  rating: number
  comment: string | null
  created_at: string
}
