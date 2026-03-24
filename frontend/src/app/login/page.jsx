'use client'

import { useTheme } from "../ThemeContext";
import TextInput from "../components/TextInput";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function MemoraSignIn() {
  const { theme } = useTheme();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMode, setRememberMode] = useState(false);

  const { user, loading, handleLogin, handleGetMe } = useAuth()

  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault();
    
    handleLogin(email, password)
    router.push("/dashboard")
        
    setEmail("")
    setPassword("")
  };

  return (
    <div
      className="min-h-[calc(100vh-81px)] flex flex-col"
      style={{
        backgroundColor: theme.background,
        color: theme.foreground,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <main className="grow flex flex-col md:flex-row">
        {/* Left Column: Hero Section */}
        <section
          className="relative w-full md:w-[60%] flex items-center justify-center overflow-hidden"
          style={{ minHeight: "calc(100vh - 80px)", backgroundColor: '#000000' }}
        >
          <img
            src="https://images.unsplash.com/photo-1737505599159-5ffc1dcbc08f?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Digital Neural Network Archive"
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
            style={{ filter: "grayscale(100%)" }}
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:"linear-gradient(to bottom, rgba(15,15,15,0.2), rgba(15,15,15,0.9))",
              boxShadow: "inset 0 0 100px rgba(0,0,0,1)"
            }}
          />

          <div className="relative z-10 px-8 md:px-16 text-left max-w-2xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.3)" }}></div>
              <span
                className="text-xl font-extrabold tracking-tight uppercase"
                style={{ fontFamily: "'Manrope', sans-serif", color: '#ffffff' }}
              >
                Memora
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight"
              style={{ fontFamily: "'Manrope', sans-serif", color: '#ffffff' }}
            >
              Your cognitive{' '}
              <span style={{ color: '#ffffff' }}>journey</span>
              <br />
              <span style={{ color: '#ffffff' }}>begins here.</span>
            </h1>

            <div className="mt-12" style={{ opacity: 0.7 }}>
              <span
                className="inline-block text-xs uppercase tracking-widest px-3 py-2 rounded"
                style={{ color: theme.muted, backgroundColor: `${theme.foreground}15` }}
              >
                Digital Archive
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Sign In Form */}
        <section
          className="w-full md:w-[40%] flex flex-col items-center justify-center p-8 md:p-12 lg:p-20"
          style={{ backgroundColor: theme.background, minHeight: "calc(100vh - 80px)" }}
        >
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-12">
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: theme.muted, fontFamily: "'Manrope', sans-serif" }}
              >
                Authentication
              </p>
              <h2
                className="text-5xl font-black tracking-tight mb-2"
                style={{ fontFamily: "'Manrope', sans-serif", color: theme.heading, lineHeight: 1.2 }}
              >
                Access<br />Archive
              </h2>
            </div>

            {/* Form */}
            <form className="space-y-6">
              <TextInput
                id="email"
                label="IDENTITY / EMAIL"
                type="email"
                placeholder="archetype@ethos.digital"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                theme={theme}
              />
              <TextInput
                id="password"
                label="KEY / PASSWORD"
                type="password"
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                theme={theme}
              />

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMode}
                    onChange={(e) => setRememberMode(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: rememberMode ? theme.foreground : `${theme.foreground}1a`, border: `1px solid ${theme.foreground}4d` }}
                  />
                  <span className="text-xs uppercase tracking-wide" style={{ color: theme.muted }}>
                    Remember Mode
                  </span>
                </label>
                <Link href="#" className="text-xs uppercase tracking-wide transition-colors" style={{ color: theme.foreground }}>
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 text-sm font-bold uppercase tracking-wide transition-all"
                  style={{
                    backgroundColor: theme.foreground,
                    color: theme.background,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? '0.7' : '1'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  {loading ? "Initializing..." : "Initialize Session"}
                </button>
              </div>
            </form>

            <div
              className="mt-8 pt-8"
              style={{ borderTop: `1px solid ${theme.divider}` }}
            ></div>

            <div className="mt-8 text-center" style={{ fontFamily: "'Manrope', sans-serif"}}>
                <p className="text-sm" style={{ color: theme.muted }}>
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    className="font-bold ml-1 transition-colors"
                    style={{ color: theme.heading, textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                >
                    Sign up
                </Link>
                </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
