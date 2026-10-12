import WorldLoader from "@/components/world/WorldLoader";
import { ROOMS } from "@/store/game";

// Server component: ships crawlable text (SEO / reduced-motion fallback),
// the 3D world itself is client-only and loaded below.
export default function Home() {
  return (
    <main className="relative h-dvh w-full">
      <article className="sr-only-seo">
        <h1>SolidBytes HQ — Mission: Ship It</h1>
        <p>
          SolidBytes xây phần mềm AI, voice, 3D và hệ thống chịu tải cao. Bước vào trụ sở 3D, nói chuyện với AI
          companion và gửi mission của bạn.
        </p>
        {ROOMS.map((r) => (
          <section key={r.id}>
            <h2>
              {r.label} — {r.shows}
            </h2>
            <p>{r.caption}</p>
          </section>
        ))}
      </article>
      <WorldLoader />
    </main>
  );
}
