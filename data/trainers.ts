export type Trainer = {
  id: string;
  name: string;
  initials: string;
  color: string; // hex color, used directly in Avatar's inline style
  role: string;
  bio: string;
  fullBio: string;
  tagVariant: "flame" | "moss" | "chalk";
  tagLabel: string;
  credential: string;
  certifications: string[];
  rating: number;
  reviewCount: number;
  services: { name: string; sub: string; price: number }[];
  availability: {
    day: string;
    slots: { time: string; free: boolean }[];
    closed?: boolean;
  }[];
};

export const trainers: Trainer[] = [
  {
    id: "jordan-reyes",
    name: "Jordan Reyes",
    initials: "JR",
    color: "#3f6b48",
    role: "Strength & conditioning",
    bio: "Powerlifting background, 9 years coaching. Best for clients chasing a strength number.",
    fullBio:
      "Nine years coaching powerlifting and general strength. Jordan builds programs around one clear number — a total, a 1RM, a bodyweight pull-up — and works backward from there.",
    tagVariant: "moss",
    tagLabel: "Strength",
    credential: "CSCS",
    certifications: [
      "CSCS — Certified Strength & Conditioning Specialist",
      "USA Powerlifting Coach",
      "CPR / AED certified",
    ],
    rating: 4.9,
    reviewCount: 118,
    services: [
      { name: "1-on-1 session", sub: "60 minutes", price: 65 },
      { name: "1-on-1 session", sub: "30 minutes", price: 40 },
      { name: "Strength assessment", sub: "45 minutes · first-time clients", price: 30 },
    ],
    availability: [
      { day: "MON", slots: [{ time: "7:00a", free: true }, { time: "9:00a", free: false }, { time: "5:30p", free: true }] },
      { day: "TUE", slots: [{ time: "7:00a", free: false }, { time: "6:30p", free: true }] },
      { day: "WED", slots: [{ time: "7:00a", free: true }, { time: "12:00p", free: true }] },
      { day: "THU", slots: [{ time: "9:00a", free: false }, { time: "5:30p", free: true }] },
      { day: "FRI", slots: [{ time: "7:00a", free: true }, { time: "6:30p", free: false }] },
      { day: "SAT", slots: [{ time: "9:00a", free: true }] },
      { day: "SUN", slots: [], closed: true },
    ],
  },
  {
    id: "amara-osei",
    name: "Amara Osei",
    initials: "AO",
    color: "#ff5a1f",
    role: "Mobility & recovery",
    bio: "Physio-trained, specializes in return-to-training after injury and long-term mobility work.",
    fullBio:
      "Physio-trained, specializes in return-to-training after injury and long-term mobility work. Amara focuses on sustainable movement patterns before adding load.",
    tagVariant: "flame",
    tagLabel: "Mobility",
    credential: "DPT",
    certifications: [
      "DPT — Doctor of Physical Therapy",
      "Certified Mobility Specialist",
      "CPR / AED certified",
    ],
    rating: 4.8,
    reviewCount: 96,
    services: [
      { name: "1-on-1 session", sub: "60 minutes", price: 70 },
      { name: "Mobility screen", sub: "45 minutes · first-time clients", price: 35 },
    ],
    availability: [
      { day: "MON", slots: [{ time: "8:00a", free: true }] },
      { day: "TUE", slots: [{ time: "8:00a", free: false }, { time: "4:00p", free: true }] },
      { day: "WED", slots: [{ time: "8:00a", free: true }] },
      { day: "THU", slots: [{ time: "4:00p", free: true }] },
      { day: "FRI", slots: [{ time: "8:00a", free: true }] },
      { day: "SAT", slots: [], closed: true },
      { day: "SUN", slots: [], closed: true },
    ],
  },
  {
    id: "leo-martins",
    name: "Leo Martins",
    initials: "LM",
    color: "#c98f16",
    role: "Sport performance",
    bio: "Former college athlete. Builds speed, agility, and in-season maintenance plans.",
    fullBio:
      "Former college athlete. Leo builds speed, agility, and in-season maintenance plans for competitive athletes at every level.",
    tagVariant: "chalk",
    tagLabel: "Performance",
    credential: "NASM",
    certifications: ["NASM — Performance Enhancement Specialist", "CPR / AED certified"],
    rating: 4.7,
    reviewCount: 74,
    services: [
      { name: "1-on-1 session", sub: "60 minutes", price: 60 },
      { name: "Speed & agility session", sub: "45 minutes", price: 50 },
    ],
    availability: [
      { day: "MON", slots: [{ time: "6:00a", free: true }] },
      { day: "TUE", slots: [{ time: "6:00a", free: true }] },
      { day: "WED", slots: [], closed: true },
      { day: "THU", slots: [{ time: "6:00a", free: false }] },
      { day: "FRI", slots: [{ time: "6:00a", free: true }] },
      { day: "SAT", slots: [{ time: "9:00a", free: true }] },
      { day: "SUN", slots: [], closed: true },
    ],
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    initials: "PN",
    color: "#5b6670",
    role: "Nutrition & weight training",
    bio: "Registered dietitian and coach. Pairs training blocks with a nutrition plan you'll stick to.",
    fullBio:
      "Registered dietitian and coach. Priya pairs strength training blocks with a nutrition plan built around what clients will actually stick to.",
    tagVariant: "moss",
    tagLabel: "Nutrition",
    credential: "RD",
    certifications: ["RD — Registered Dietitian", "NASM-CPT", "CPR / AED certified"],
    rating: 5.0,
    reviewCount: 61,
    services: [
      { name: "1-on-1 session", sub: "60 minutes", price: 68 },
      { name: "Nutrition consult", sub: "30 minutes", price: 45 },
    ],
    availability: [
      { day: "MON", slots: [{ time: "10:00a", free: true }] },
      { day: "TUE", slots: [{ time: "10:00a", free: true }] },
      { day: "WED", slots: [{ time: "10:00a", free: false }] },
      { day: "THU", slots: [{ time: "10:00a", free: true }] },
      { day: "FRI", slots: [], closed: true },
      { day: "SAT", slots: [{ time: "10:00a", free: true }] },
      { day: "SUN", slots: [], closed: true },
    ],
  },
];