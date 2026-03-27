'use client'

import { useTheme } from "../ThemeContext";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { useState } from "react";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/navigation";


export default function MemoraSignUp() {
  const { theme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user, setLoading, handleRegister } = useAuth()
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault();
    // handle signup

    handleRegister(fullName, email, password)
    setLoading(false)
    router.push("/library")

    setFullName("")
    setEmail("")
    setPassword("")

    console.log(user);
  };

  return (
    <div
      className="min-h-[calc(100vh-81px)] flex flex-col"
      style={{ backgroundColor: theme.background, color: theme.foreground, fontFamily: "'Inter', sans-serif" }}
    >
      <main className="grow flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
        {/* Left Column: Hero Section */}
        <section className="relative w-full md:w-[60%] overflow-hidden flex items-center justify-center" style={{ minHeight: "calc(100vh - 80px)", backgroundColor: '#000000' }}>
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="Register-page.png"
              alt="Digital discovery"
              className="w-full h-full object-cover"
              style={{ filter: "grayscale(100%)" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:"linear-gradient(to bottom, rgba(15,15,15,0.2), rgba(15,15,15,0.9))",
                boxShadow: "inset 0 0 100px rgba(0,0,0,1)"
              }}
            />
          </div>

          <div className="relative z-10 px-8 md:px-16 text-left max-w-2xl">

            <div className="mb-8 flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded" 
                style={{ backgroundColor: "rgba(255,255,255,0.1)", 
                border: "2px solid rgba(255,255,255,0.3)" 
               }}>
                <DotLottieReact
                    src="https://lottie.host/0fac2c3a-5a4a-4eb3-bd45-475df73c4a1d/dTbEcUhmQS.lottie"
                    loop
                    autoplay
                />
              </div>
              <span
                className="text-xl font-extrabold tracking-tight uppercase"
                style={{ 
                    fontFamily: "'Manrope', sans-serif", 
                    color: '#ffffff' 
                }}
              >
                Memora
              </span>
            </div>

            <h1
              className="text-5xl font-black tracking-tight mb-6 leading-tight"
              style={{ fontFamily: "'Manrope', sans-serif", color: '#ffffff' }}
            >
              JOIN THE<br/>
              <span style={{ color: '#ffffff' }}>COLLECTIVE</span><br/>
              <span style={{ color: '#ffffff' }}>CONSCIOUSNESS.</span>
            </h1>

            <div className="mt-12" style={{ opacity: 0.7 }}>
              <span
                className="inline-block text-xs uppercase tracking-widest px-3 py-2 rounded"
                style={{ color: theme.muted, backgroundColor: `${theme.foreground}15` }}
              >
                Secure Archive
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Signup Form */}
        <section
          className="w-full md:w-[40%] flex flex-col justify-center items-center px-6 py-12 md:py-20"
          style={{ backgroundColor: theme.background }}
        >
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-12">
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: theme.muted, fontFamily: "'Manrope', sans-serif" }}
              >
                INITIALIZE ARCHIVE
              </p>
              <h2
                className="text-5xl font-black tracking-tight mb-2"
                style={{ fontFamily: "'Manrope', sans-serif", color: theme.heading, lineHeight: 1.2 }}
              >
                Create Archive
              </h2>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name */}
              <TextInput
                id="full-name"
                label="IDENTITY NAME"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                theme={theme}
              />
              <TextInput
                id="email"
                label="ACCESS ENDPOINT"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                theme={theme}
              />
              <TextInput
                id="password"
                label="SECURITY CIPHER"
                type="password"
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                theme={theme}
              />

              {/* Submit */}
              <div className="pt-4">
                <Button
                  theme={theme}
                  variant="auth"
                  type="submit"
                  className="w-full"
                >
                  Create Archive
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div
              className="mt-8 pt-8"
              style={{ borderTop: `1px solid ${theme.divider}` }}
            ></div>

            {/* Login Link */}
            <div className="mt-8 text-center" style={{ fontFamily: "'Manrope', sans-serif"}}>
              <p className="text-sm" style={{ color: theme.muted }}>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold ml-1 transition-colors"
                    style={{ color: theme.heading, textDecoration: "none" }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
