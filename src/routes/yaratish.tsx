import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import { encodeInvite, photoChoices, type InviteInput } from "@/lib/invite-link";
import { fieldCls } from "@/components/wedding/Rsvp";
import { Ornament } from "@/components/site/Reveal";

export const Route = createFileRoute("/yaratish")({
  head: () => ({
    meta: [
      { title: "Taklifnoma yaratish — o‘z to‘y taklifnomangiz" },
      { name: "description", content: "Ismlar, sana va manzilni kiriting — tayyor to‘y taklifnomasi havolasini oling." },
      { property: "og:title", content: "O‘z to‘y taklifnomangizni yarating" },
      { property: "og:description", content: "Bir necha daqiqada nafis raqamli taklifnoma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Builder,
});

const empty: InviteInput = {
  groom: "", bride: "", date: "", venueName: "", address: "", dressCode: "", notes: "", message: "", photo: 0,
};
const KEY = "invite-draft";

function Builder() {
  const [f, setF] = useState<InviteInput>(empty);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setF({ ...empty, ...JSON.parse(s) });
    } catch { /* ignore */ }
  }, []);

  const set = <K extends keyof InviteInput>(k: K, v: InviteInput[K]) => {
    const next = { ...f, [k]: v };
    setF(next);
    setLink("");
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const create = () => {
    if (f.groom.trim().length < 2 || f.bride.trim().length < 2) return setError("Kuyov va kelin ismlarini kiriting");
    if (!f.date) return setError("To‘y sanasi va vaqtini tanlang");
    if (!f.venueName.trim()) return setError("To‘yxona nomini kiriting");
    setError("");
    setLink(`${window.location.origin}/t?d=${encodeInvite(f)}`);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); toast.success("Havola nusxalandi"); }
    catch { toast.error("Nusxalab bo‘lmadi"); }
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `${f.groom} & ${f.bride}`, text: "To‘y taklifnomasi", url: link }); } catch { /* cancelled */ }
    } else copy();
  };

  const input = (k: keyof InviteInput, label: string, props: Record<string, unknown> = {}) => (
    <div>
      <label htmlFor={k} className="eyebrow">{label}</label>
      <input id={k} value={String(f[k])} onChange={(e) => set(k, e.target.value as never)} className={fieldCls} {...props} />
    </div>
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link to="/" className="eyebrow">← Namuna</Link>
      <h1 className="section-title mt-6 text-center">Taklifnoma yaratish</h1>
      <p className="mt-4 text-center text-muted-foreground">Ma’lumotlarni kiriting — tayyor havolani mehmonlarga yuboring.</p>
      <Ornament className="my-10" />

      <div className="space-y-7">
        <div className="grid gap-7 sm:grid-cols-2">
          {input("groom", "Kuyov ismi *", { placeholder: "Jasur" })}
          {input("bride", "Kelin ismi *", { placeholder: "Madina" })}
        </div>
        {input("date", "Sana va vaqt *", { type: "datetime-local" })}
        <div className="grid gap-7 sm:grid-cols-2">
          {input("venueName", "To‘yxona nomi *", { placeholder: "Navro‘z Saroyi" })}
          {input("address", "Manzil", { placeholder: "Ko‘cha, uy, shahar" })}
        </div>
        {input("dressCode", "Kiyinish uslubi", { placeholder: "Klassik kechki libos" })}
        {input("notes", "Eslatma", { placeholder: "Kelishingizni oldindan tasdiqlang" })}
        <div>
          <label htmlFor="message" className="eyebrow">Mehmonlarga xabar</label>
          <textarea id="message" rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} className={fieldCls} placeholder="Hayotimizning eng baxtli kunida..." />
        </div>
        <fieldset>
          <legend className="eyebrow">Asosiy surat</legend>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {photoChoices.map((p, i) => (
              <button key={i} type="button" onClick={() => set("photo", i)} aria-pressed={f.photo === i} aria-label={p.alt}
                className={`aspect-[3/4] overflow-hidden border-2 transition ${f.photo === i ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <img src={p.src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="button" onClick={create} className="w-full bg-primary py-4 eyebrow !text-primary-foreground hover:opacity-90">
          Taklifnomani yaratish
        </button>

        {link && (
          <div role="status" className="border border-gold p-6 text-center animate-fade-up">
            <p className="font-serif text-2xl">Taklifnomangiz tayyor!</p>
            <p className="mt-3 break-all text-xs text-muted-foreground">{link}</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border border-primary py-3 eyebrow !text-primary"><ExternalLink className="h-4 w-4" />Ochish</a>
              <button onClick={copy} className="flex items-center justify-center gap-2 border border-primary py-3 eyebrow !text-primary"><Copy className="h-4 w-4" />Nusxalash</button>
              <button onClick={share} className="flex items-center justify-center gap-2 bg-primary py-3 eyebrow !text-primary-foreground"><Share2 className="h-4 w-4" />Ulashish</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
