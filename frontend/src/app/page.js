'use client'

import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTheme } from "./ThemeContext";
import useAuth from "./hooks/useAuth";
import ScrollReveal from "./components/ScrollReveal";
import VariableProximity from "./components/VariableProximity";

gsap.registerPlugin(useGSAP);

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
  const pageRef = useRef(null)
  const containerRef = useRef(null)
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  useGSAP(
    () => {
      const q = gsap.utils.selector(pageRef)

      gsap.set(q('[data-gsap="hero-cta"]'), { autoAlpha: 1 })

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(q('[data-gsap="hero-eyebrow"]'), {
        y: 18,
        opacity: 0,
        duration: 0.55,
      })
        .from(
          q('[data-gsap="hero-line"]'),
          {
            y: 48,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
          },
          "-=0.28"
        )
        .from(
          q('[data-gsap="hero-copy"]'),
          {
            y: 20,
            opacity: 0,
            duration: 0.55,
          },
          "-=0.42"
        )
        .from(
          q('[data-gsap="hero-cta"]'),
          {
            y: 14,
            duration: 0.45,
            stagger: 0.09,
          },
          "-=0.35"
        )
        .from(
          q('[data-gsap="feature-card"]'),
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
          },
          "-=0.16"
        )

      const featureCardsEls = q('[data-gsap="feature-card"]')
      const ctaLinkEls = q('[data-gsap="interactive-link"]')

      const cleanup = []

      featureCardsEls.forEach((card) => {
        const onEnter = () => {
          gsap.to(card, {
            y: -6,
            scale: 0.99,
            boxShadow:
              theme.background === "#000000"
                ? "0 16px 34px rgba(0,0,0,0.45)"
                : "0 16px 34px rgba(0,0,0,0.14)",
            duration: 0.28,
            ease: "power2.out",
          })
        }

        const onLeave = () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            boxShadow: "none",
            duration: 0.28,
            ease: "power2.out",
          })
        }

        card.addEventListener("mouseenter", onEnter)
        card.addEventListener("mouseleave", onLeave)
        cleanup.push(() => {
          card.removeEventListener("mouseenter", onEnter)
          card.removeEventListener("mouseleave", onLeave)
        })
      })

      ctaLinkEls.forEach((link) => {
        const icon = link.querySelector('[data-gsap="interactive-icon"]')
        if (!icon) return

        const onEnter = () => {
          gsap.to(icon, { x: 6, duration: 0.24, ease: "power2.out" })
        }

        const onLeave = () => {
          gsap.to(icon, { x: 0, duration: 0.24, ease: "power2.out" })
        }

        link.addEventListener("mouseenter", onEnter)
        link.addEventListener("mouseleave", onLeave)
        cleanup.push(() => {
          link.removeEventListener("mouseenter", onEnter)
          link.removeEventListener("mouseleave", onLeave)
        })
      })

      return () => {
        cleanup.forEach((fn) => fn())
      }
    },
    { scope: pageRef }
  )

  return (
    <main
      ref={pageRef}
      className="min-h-[calc(100vh-81px)]"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <section className="mx-auto max-w-400 px-6 pb-20 pt-10 md:px-8 md:pb-28 md:pt-14">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-5xl">
            <p
              data-gsap="hero-eyebrow"
              className="mb-8 text-[11px] tracking-[0.34em]"
              style={{ color: theme.muted }}
            >
              COGNITIVE ARCHIVE
            </p>

            <h1 className="text-[clamp(4.1rem,11vw,9.8rem)] font-black uppercase leading-[0.88] tracking-[-0.08em]">
              <div
                ref={containerRef}
                className="relative"
              >
                <span data-gsap="hero-line" className="block">
                  <VariableProximity
                    label="YOUR"
                    className="inline-block"
                    fromFontVariationSettings="'wght' 760, 'opsz' 24"
                    toFontVariationSettings="'wght' 1000, 'opsz' 56"
                    containerRef={containerRef}
                    radius={120}
                    falloff="linear"
                  />
                </span>
                <span data-gsap="hero-line" className="block">
                  <VariableProximity
                    label="INTERNET,"
                    className="inline-block"
                    fromFontVariationSettings="'wght' 760, 'opsz' 24"
                    toFontVariationSettings="'wght' 1000, 'opsz' 56"
                    containerRef={containerRef}
                    radius={120}
                    falloff="linear"
                  />
                </span>
                <span
                  data-gsap="hero-line"
                  className="block"
                  style={{ color: theme.background === "#000000" ? "rgba(255,255,255,0.11)" : "rgba(0,0,0,0.12)" }}
                >
                  <VariableProximity
                    label="INTELLIGENTLY"
                    className="inline-block"
                    fromFontVariationSettings="'wght' 760, 'opsz' 24"
                    toFontVariationSettings="'wght' 1000, 'opsz' 56"
                    containerRef={containerRef}
                    radius={120}
                    falloff="linear"
                  />
                </span>
                <span data-gsap="hero-line" className="block">
                  <VariableProximity
                    label="ORGANIZED"
                    className="inline-block"
                    fromFontVariationSettings="'wght' 760, 'opsz' 24"
                    toFontVariationSettings="'wght' 1000, 'opsz' 56"
                    containerRef={containerRef}
                    radius={120}
                    falloff="linear"
                  />
                </span>
              </div>
            </h1>
          </div>

          <div data-gsap="hero-copy" className="max-w-md lg:self-start lg:mt-16">
            <p
              className="text-base leading-7"
              style={{ color: theme.hint }}
            >
              Memora is a cognitive extension for your digital life. Every link, thought, and
              discovery is automatically filed into a neural network designed for instant retrieval.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                data-gsap="hero-cta"
                href={user ? "/library" : "/login"}
                className="inline-flex items-center justify-center border px-4 py-3 rounded text-[10px] font-semibold tracking-[0.15em] transition-opacity hover:opacity-85"
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
        <div className="mx-auto max-w-400 px-6 md:px-8">
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
                data-gsap="feature-card"
                className={`relative overflow-hidden p-8 ${
                  card.wide ? "min-h-90" : "min-h-90"
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
                <h3 className="mt-6 max-w-[12ch] text-[clamp(1rem,4vw,2.5rem)] font-black uppercase leading-[0.95] tracking-[-0.06em]">
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

          <div className="mt-4">
            <article
              data-gsap="feature-card"
              className="grid gap-8 overflow-hidden p-8 md:grid-cols-[minmax(0,1fr)_280px] md:p-12"
              style={{
                backgroundColor: theme.panelInner,
                border: `1px solid ${theme.lowBorder}`,
              }}
            >
              <div>
                <p className="text-[10px] tracking-[0.32em]" style={{ color: theme.muted }}>
                  BROWSER EXTENSION
                </p>
                <h3 className="mt-5 max-w-[11ch] text-[clamp(2rem,4vw,3.5rem)] font-black uppercase leading-[0.95] tracking-[-0.06em]">
                  CAPTURE IN ONE CLICK
                </h3>
                <p className="mt-6 max-w-[42ch] text-sm leading-7" style={{ color: theme.hint }}>
                  Save links, notes, and discoveries directly from your browser into Memora without breaking flow.
                  Everything syncs to your archive instantly.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-2.5">
                  <Link
                    href="https://github.com/Vishalnaidu77/memora/releases/download/v1.0.0/extension.zip"
                    className="inline-flex items-center justify-center border px-4 py-3 rounded text-[10px] font-semibold tracking-[0.15em] transition-opacity hover:opacity-85"
                    style={{
                      borderColor: theme.foreground,
                      backgroundColor: theme.foreground,
                      color: theme.background,
                    }}
                  >
                    DOWNLOAD EXTENSION
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowSetupGuide(true)}
                    className="inline-flex items-center justify-center cursor-pointer border px-4 py-3 rounded text-[10px] font-semibold tracking-[0.15em] transition-opacity hover:opacity-85"
                    style={{
                      borderColor: theme.lowBorder,
                      backgroundColor: "transparent",
                      color: theme.foreground,
                    }}
                  >
                    SETUP GUIDE
                  </button>
                </div>
              </div>

              <div
                className="relative min-h-55 overflow-hidden"
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
            <ScrollReveal
              baseOpacity={0.2}
              enableBlur
              baseRotation={1.1}
              blurStrength={1.3}
              rotationEnd="bottom center+=12%"
              wordAnimationEnd="bottom center+=12%"
            >
              “Memora is the first tool that treats your browser as an extension of my biological
              memory, rather than a separate database.”
            </ScrollReveal>    
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
        <div className="mx-auto max-w-400 px-6 py-24 md:px-8 md:py-28">
          <div
            className="border-t pt-8"
            style={{ borderColor: theme.lowBorder }}
          >
            <span className="text-[clamp(4rem,10vw,8rem)] font-black uppercase leading-[0.9] tracking-[-0.08em]">
              <div
                ref={containerRef}
                style={{position: 'relative'}}
                >
                  <VariableProximity
                    label={'Ready ?'}
                    className={'variable-proximity-demo'}
                    fromFontVariationSettings="'wght' 400, 'opsz' 9"
                    toFontVariationSettings="'wght' 1000, 'opsz' 40"
                    containerRef={containerRef}
                    radius={100}
                    falloff='linear'
                />
              </div>
            </span>
            <p className="mt-8 max-w-md text-base leading-7" style={{ color: theme.hint }}>
              The internet is a vast ocean. Stop drowning. Start archiving with intention.
            </p>
            <Link
              data-gsap="interactive-link"
              href={user ? "/library" : "/login"}
              className="mt-10 inline-flex items-center gap-3 border-b pb-2 text-sm font-semibold tracking-[0.18em]"
              style={{ borderColor: theme.foreground }}
            >
              {user ? "ACCESS ARCHIVE" : "START ARCHIVE"}
              <span data-gsap="interactive-icon" aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </section>

      <footer
        className="border-t px-6 py-5 md:px-8"
        style={{ borderColor: theme.lowBorder }}
      >
        <div className="mx-auto flex max-w-400 flex-col gap-4 text-[10px] tracking-[0.26em] md:flex-row md:items-center md:justify-between">
          <p style={{ color: theme.muted }}>© 2026 MEMORA. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6" style={{ color: theme.muted }}>
            <span>PRIVACY</span>
            <span>TERMS</span>
            <span>CONTACT</span>
          </div>
        </div>
      </footer>

      {showSetupGuide ? (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowSetupGuide(false)}
        >
          <div
            className="w-full max-w-xl border p-6 md:p-8"
            style={{
              backgroundColor: theme.panelOuter,
              borderColor: theme.lowBorder,
              color: theme.foreground,
              boxShadow: `0 10px 30px ${theme.shadow}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-[clamp(1.4rem,3vw,2rem)] font-black uppercase tracking-[-0.04em]">
                Setup Guide
              </h3>
              <button
                type="button"
                onClick={() => setShowSetupGuide(false)}
                className="border px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em]"
                style={{ borderColor: theme.lowBorder, color: theme.muted }}
              >
                CLOSE
              </button>
            </div>

            <p className="mt-6 text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
              INSTALLATION STEPS
            </p>

            <ol className="mt-4 space-y-3 text-sm leading-7" style={{ color: theme.hint }}>
              <li>1. Download and extract the ZIP file.</li>
              <li>2. Open Chrome and go to chrome://extensions.</li>
              <li>3. Enable Developer Mode (top right toggle).</li>
              <li>4. Click "Load unpacked".</li>
              <li>5. Select the extracted memora-extension folder.</li>
              <li>6. Memora icon will appear in your toolbar.</li>
              <li>7. Login to Memora first, then click the icon to save any page.</li>
            </ol>
          </div>
        </div>
      ) : null}
    </main>
  );
}
