'use client'

import Link from "next/link";
import { useTheme } from "./ThemeContext";
import useAuth from "./hooks/useAuth";

const featureCards = [
  {
    eyebrow: "AUTOMATION",
    title: "AUTOMATIC ORGANIZATION",
    description:
      "No folders. No tags. Our engine understands the semantic context of every save, grouping related concepts across disparate sources.",
    wide: true,
  },
  {
    eyebrow: "01 // SYSTEMS OF RETRIEVAL",
    title: "INTELLIGENT RELATIONS",
    description:
      "See the invisible threads. Memora maps connections between your 2019 research and today's news.",
  },
];

export default function Home() {
  const { theme } = useTheme();
  const { user } = useAuth()

  return (
    <main
      className="min-h-[calc(100vh-81px)]"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <section className="mx-auto max-w-[1600px] px-6 pb-20 pt-10 md:px-8 md:pb-28 md:pt-14">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-5xl">
            <p
              className="mb-8 text-[11px] tracking-[0.34em]"
              style={{ color: theme.muted }}
            >
              COGNITIVE ARCHIVE
            </p>

            <h1 className="text-[clamp(4.1rem,11vw,9.8rem)] font-black uppercase leading-[0.88] tracking-[-0.08em]">
              <span className="block">YOUR</span>
              <span className="block">INTERNET,</span>
              <span
                className="block"
                style={{ color: theme.background === "#000000" ? "rgba(255,255,255,0.11)" : "rgba(0,0,0,0.12)" }}
              >
                INTELLIGENTLY
              </span>
              <span className="block">ORGANIZED</span>
            </h1>
          </div>

          <div className="max-w-sm lg:pb-6">
            <p
              className="text-base leading-7"
              style={{ color: theme.hint }}
            >
              Memora is a cognitive extension for your digital life. Every link, thought, and
              discovery is automatically filed into a neural network designed for instant retrieval.
            </p>

            <Link
              href={user ? "/library" : "/login"}
              className="mt-10 inline-flex items-center justify-center border px-8 py-4 text-[11px] font-semibold tracking-[0.3em] transition-opacity hover:opacity-85"
              style={{
                borderColor: theme.foreground,
                backgroundColor: theme.foreground,
                color: theme.background,
              }}
            >
              {user ? "ACCESS ARCHIVE" : "START ARCHIVE"}
            </Link>
          </div>
        </div>
      </section>

      <section
        className="border-y py-20 md:py-24"
        style={{
          borderColor: theme.lowBorder,
          background:
            theme.background === "#000000"
              ? "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 100%)",
        }}
      >
        <div className="mx-auto max-w-[1600px] px-6 md:px-8">
          <div className="mb-12 flex items-end justify-between gap-6">
            <h2 className="text-[clamp(2.6rem,6vw,4.8rem)] font-black uppercase tracking-[-0.06em]">
              INFRASTRUCTURE
            </h2>
            <p className="hidden text-[10px] tracking-[0.42em] md:block" style={{ color: theme.muted }}>
              01 // SYSTEMS OF RETRIEVAL
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className={`relative overflow-hidden p-8 md:p-12 ${
                  card.wide ? "min-h-[360px]" : "min-h-[360px]"
                }`}
                style={{
                  backgroundColor: theme.panelInner,
                  border: `1px solid ${theme.lowBorder}`,
                  backgroundImage: card.wide
                    ? theme.background === "#000000"
                      ? "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05), transparent 24%), repeating-radial-gradient(circle at 0 0, transparent 0, transparent 10px, rgba(255,255,255,0.015) 11px, rgba(255,255,255,0.015) 12px)"
                      : "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.05), transparent 24%), repeating-radial-gradient(circle at 0 0, transparent 0, transparent 10px, rgba(0,0,0,0.03) 11px, rgba(0,0,0,0.03) 12px)"
                    : undefined,
                }}
              >
                <p className="text-[10px] tracking-[0.32em]" style={{ color: theme.muted }}>
                  {card.eyebrow}
                </p>
                <h3 className="mt-6 max-w-[12ch] text-[clamp(2rem,4vw,3.6rem)] font-black uppercase leading-[0.95] tracking-[-0.06em]">
                  {card.title}
                </h3>
                <p className="mt-6 max-w-[32ch] text-sm leading-7" style={{ color: theme.hint }}>
                  {card.description}
                </p>

                {!card.wide ? (
                  <div
                    className="absolute bottom-8 left-8 flex h-10 w-10 items-center justify-center rounded-full text-lg font-black"
                    style={{
                      backgroundColor: theme.foreground,
                      color: theme.background,
                    }}
                  >
                    +
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <article
            className="mt-4 grid gap-8 overflow-hidden p-8 md:grid-cols-[minmax(0,1fr)_280px] md:p-12"
            style={{
              backgroundColor: theme.panelInner,
              border: `1px solid ${theme.lowBorder}`,
            }}
          >
            <div>
              <p className="text-[10px] tracking-[0.32em]" style={{ color: theme.muted }}>
                RESURFACING
              </p>
              <h3 className="mt-5 max-w-[11ch] text-[clamp(2rem,4vw,3.5rem)] font-black uppercase leading-[0.95] tracking-[-0.06em]">
                SMART RESURFACING
              </h3>
              <p className="mt-6 max-w-[42ch] text-sm leading-7" style={{ color: theme.hint }}>
                The right information at the exact moment of need. Memora isn&apos;t a graveyard for
                links. It&apos;s a living memory.
              </p>
            </div>

            <div
              className="relative min-h-[220px] overflow-hidden"
              style={{
                background:
                  theme.background === "#000000"
                    ? "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.16), transparent 16%), linear-gradient(180deg, #080808 0%, #020202 100%)"
                    : "radial-gradient(circle at 50% 35%, rgba(0,0,0,0.16), transparent 16%), linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%)",
                border: `1px solid ${theme.lowBorder}`,
              }}
            >
              <div
                className="absolute left-1/2 top-[18%] h-[58%] w-[34%] -translate-x-1/2"
                style={{
                  background:
                    theme.background === "#000000"
                      ? "linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.03))"
                      : "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.05))",
                  clipPath: "polygon(52% 0%, 70% 14%, 82% 48%, 58% 100%, 26% 80%, 18% 40%, 34% 8%)",
                  filter: "blur(0.3px)",
                }}
              />
              <div
                className="absolute bottom-6 left-1/2 h-6 w-36 -translate-x-1/2 rounded-[999px]"
                style={{
                  background:
                    theme.background === "#000000"
                      ? "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)"
                      : "radial-gradient(circle, rgba(0,0,0,0.18), transparent 70%)",
                }}
              />
            </div>
          </article>
        </div>
      </section>

      <section className="px-6 py-28 md:px-8 md:py-36">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[10px] tracking-[0.5em]" style={{ color: theme.muted }}>
            99
          </p>
          <blockquote
            className="mt-10 text-[clamp(2rem,4.2vw,3.6rem)] italic leading-[1.15] tracking-[-0.04em]"
            style={{ color: theme.foreground }}
          >
            “Memora is the first tool that treats my browser as an extension of my biological
            memory, rather than a separate database.”
          </blockquote>
          <p className="mt-10 text-[10px] tracking-[0.42em]" style={{ color: theme.muted }}>
            EDITORIAL REVIEW // VOL 04
          </p>
        </div>
      </section>

      <section
        className="border-t"
        style={{
          borderColor: theme.lowBorder,
          background:
            theme.background === "#000000"
              ? "linear-gradient(90deg, #080808 0%, #0e0e10 55%, #1c1c1f 100%)"
              : "linear-gradient(90deg, #ffffff 0%, #f5f5f5 55%, #ebebeb 100%)",
        }}
      >
        <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-8 md:py-28">
          <div
            className="border-t pt-8"
            style={{ borderColor: theme.lowBorder }}
          >
            <h2 className="text-[clamp(4rem,10vw,8rem)] font-black uppercase leading-[0.9] tracking-[-0.08em]">
              READY?
            </h2>
            <p className="mt-8 max-w-md text-base leading-7" style={{ color: theme.hint }}>
              The internet is a vast ocean. Stop drowning. Start archiving with intention.
            </p>
            <Link
              href={user ? "/library" : "/login"}
              className="mt-10 inline-flex items-center gap-3 border-b pb-2 text-sm font-semibold tracking-[0.18em]"
              style={{ borderColor: theme.foreground }}
            >
              {user ? "ACCESS ARCHIVE" : "START ARCHIVE"}
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </section>

      <footer
        className="border-t px-6 py-5 md:px-8"
        style={{ borderColor: theme.lowBorder }}
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 text-[10px] tracking-[0.26em] md:flex-row md:items-center md:justify-between">
          <p style={{ color: theme.muted }}>© 2026 MEMORA. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6" style={{ color: theme.muted }}>
            <span>PRIVACY</span>
            <span>TERMS</span>
            <span>CONTACT</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
