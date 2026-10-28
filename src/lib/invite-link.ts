import { wedding } from "@/config/site";
import type { WeddingData } from "@/components/wedding/Invitation";

/** Data a visitor enters in the builder. Stored in the link itself (no server). */
export type InviteInput = {
  groom: string;
  bride: string;
  date: string; // "YYYY-MM-DDTHH:mm" Tashkent time
  venueName: string;
  address: string;
  dressCode: string;
  notes: string;
  message: string;
  photo: number;
};

export const photoChoices = wedding.gallery;

const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

export function encodeInvite(i: InviteInput): string {
  const bytes = new TextEncoder().encode(JSON.stringify(i));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeInvite(s: string): InviteInput | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const o = JSON.parse(new TextDecoder().decode(bytes));
    if (!o || typeof o.groom !== "string" || typeof o.bride !== "string") return null;
    return o as InviteInput;
  } catch {
    return null;
  }
}

export function toWeddingData(i: InviteInput): WeddingData {
  const [d = "", t = ""] = i.date.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const dateLabel = y && m && day ? `${day} ${months[m - 1]} ${y}` : "Sana belgilanmagan";
  const photo = photoChoices[i.photo] ?? photoChoices[0]!;
  const q = encodeURIComponent(i.address || i.venueName);
  return {
    ...wedding,
    groom: i.groom || "Kuyov",
    bride: i.bride || "Kelin",
    date: i.date ? `${i.date}:00+05:00` : "",
    dateLabel,
    timeLabel: t || "—",
    venue: {
      ...wedding.venue,
      name: i.venueName || "To‘yxona",
      address: i.address,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
    },
    dressCode: i.dressCode || wedding.dressCode,
    notes: i.notes || wedding.notes,
    message: i.message || wedding.message,
    heroImage: photo.src,
  };
}
