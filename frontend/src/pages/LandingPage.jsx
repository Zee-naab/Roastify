import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Mic,
  Flame,
  Zap,
  Brain,
  History,
  Users,
  ChevronRight,
} from "lucide-react";

const ROASTERS = [
  {
    id: "gordon ramsay",
    emoji: "👨‍🍳",
    name: "Gordon Ramsay",
    title: "The Kitchen Tyrant",
    delay: 0,
  },
  {
    id: "kanye west",
    emoji: "🎤",
    name: "Kanye West",
    title: "The Self-Proclaimed God",
    delay: 0.05,
  },
  {
    id: "elon musk",
    emoji: "🚀",
    name: "Elon Musk",
    title: "The Awkward Billionaire",
    delay: 0.1,
  },
  {
    id: "kevin hart",
    emoji: "😂",
    name: "Kevin Hart",
    title: "The Loud Short King",
    delay: 0.15,
  },
  {
    id: "nicki minaj",
    emoji: "👑",
    name: "Nicki Minaj",
    title: "The Royal Shade-Thrower",
    delay: 0.2,
  },
  {
    id: "george carlin",
    emoji: "💭",
    name: "George Carlin",
    title: "The Cynical Philosopher",
    delay: 0.25,
  },
];

const FEATURES = [
  { icon: Flame, title: "4 Roast Modes", desc: "Gentle to absolutely savage." },
  { icon: Brain, title: "Joke Memory", desc: "Never repeats the same angle." },
  {
    icon: Zap,
    title: "Live Streaming",
    desc: "Word by word — just like stand-up.",
  },
  {
    icon: History,
    title: "Chat History",
    desc: "Pick up every conversation right where you left off.",
  },
  {
    icon: Users,
    title: "15 Celebrities",
    desc: "Each with unique personality.",
  },
  {
    icon: Mic,
    title: "In Character",
    desc: "Real speech patterns and timings.",
  },
];

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-base">
      {/* Plasma orbs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <motion.div
          className="absolute top-[-15%] left-[15%] w-[800px] h-[800px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(138,43,226,0.18) 0%, transparent 65%)",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,69,0,0.16) 0%, transparent 65%)",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </div>

      {/* Navbar */}
  <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-12 py-4 liquid-glass border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 btn-plasma rounded-xl flex items-center justify-center shadow-heat-lg/30">
            <Mic size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            Roastify
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/login")}
            className="btn-ghost px-3 sm:px-4 py-2 rounded-xl text-sm"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/login", { state: { mode: "signup" } })}
            className="btn-plasma px-4 sm:px-5 py-2 rounded-xl text-sm"
          >
            Get roasted free
          </button>
        </div>
      </nav>

      {/* Hero */}
  <section className="relative z-10 px-4 sm:px-6 pt-24 sm:pt-32 pb-20 sm:pb-24 text-center">
        <FadeUp delay={0}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 liquid-glass rounded-full text-xs text-heat border border-heat/20 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-heat animate-pulse" />
            AI · 15 Celebrity Personas · Live Streaming
          </div>
        </FadeUp>

        {/* 3D mic icon */}
        <FadeUp delay={0.1}>
          <div className="flex justify-center mb-8 sm:mb-10">
            <motion.div
              className="relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 btn-plasma rounded-[2rem] flex items-center justify-center shadow-heat-lg">
                <Mic size={38} className="text-white" />
              </div>
              <motion.div
                className="absolute -inset-4 rounded-[2.5rem] border border-heat/20"
                animate={{ scale: [1, 1.15, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute -inset-8 rounded-[3rem] border border-heat/10"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
              />
            </motion.div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-8xl leading-tight sm:leading-[0.95] tracking-tight mb-6">
            Get Roasted by Your
            <br />
            <em className="plasma-text not-italic">Favourite Celebrity</em>
          </h1>
        </FadeUp>

        <FadeUp delay={0.3}>
          <p className="text-white/40 text-base sm:text-lg max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed font-light px-2">
            Ask anything. Get destroyed. Each celebrity has unique voice, speech
            patterns, and zero mercy.
          </p>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate("/login", { state: { mode: "signup" } })}
              className="btn-plasma px-8 sm:px-10 py-4 rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2"
            >
              <Mic size={20} /> Enter the Hot Seat
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn-ghost px-8 sm:px-10 py-4 rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2"
            >
              Already a member <ChevronRight size={18} />
            </button>
          </div>
        </FadeUp>

        {/* Mock chat card */}
        <FadeUp delay={0.5} className="mt-14 sm:mt-20 max-w-lg mx-auto">
          <div className="liquid-raised rounded-2xl p-4 sm:p-5 text-left plasma-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 font-mono text-xs text-muted">
                roastify.chat
              </span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-heat/20 text-heat border border-heat/30 font-mono">
                ● LIVE
              </span>
            </div>
            <div className="flex justify-end mb-3">
              <div className="bubble-user max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm">
                My code had 47 syntax errors today.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 btn-plasma rounded-xl flex items-center justify-center text-sm flex-shrink-0">
                👨‍🍳
              </div>
              <div className="bubble-ai max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm">
                47 errors.{" "}
                <span className="text-white/55">
                  You've written code that even a rubber duck would quit on.
                </span>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* Hall of Roasters – Floating Bento Grid */}
  <section className="relative z-10 py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted text-center mb-2">
              Hall of Roasters
            </p>
            <h2 className="font-display font-black text-4xl sm:text-6xl text-center mb-10 sm:mb-14">
              Choose Your Destroyer
            </h2>
          </FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {ROASTERS.map((r) => (
              <motion.button
                key={r.id}
                onClick={() => navigate("/login")}
                className="celeb-card rounded-2xl p-4 sm:p-6 text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: r.delay }}
                whileHover={{ rotateX: 3, rotateY: -3, scale: 1.02 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="text-3xl sm:text-4xl mb-3">{r.emoji}</div>
                <div className="font-semibold text-white/90 text-sm mb-0.5">
                  {r.name}
                </div>
                <div className="text-xs text-muted leading-snug">{r.title}</div>
              </motion.button>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <p className="text-center text-muted text-sm mt-6">
              +9 more celebrities → all waiting to destroy you
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-center mb-3">
              Not your average chatbot.
            </h2>
            <p className="text-center text-white/35 mb-12 sm:mb-16 font-light max-w-md mx-auto">
              Persona engineering, joke memory, and comedy structure — so every
              roast lands differently.
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <FadeUp key={title} delay={i * 0.07}>
                <div className="liquid-raised rounded-2xl p-6 h-full group hover:border-heat/20 border border-transparent transition-colors">
                  <div className="w-10 h-10 btn-plasma rounded-xl flex items-center justify-center mb-4">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="font-semibold text-white mb-1 text-sm">
                    {title}
                  </div>
                  <div className="text-xs text-muted leading-relaxed">
                    {desc}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 sm:py-24 px-4 sm:px-6 text-center">
        <FadeUp>
          <div className="max-w-xl mx-auto liquid-raised rounded-3xl p-8 sm:p-14 plasma-border">
            <motion.div
              className="w-16 h-16 btn-plasma rounded-2xl flex items-center justify-center mx-auto mb-6"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255,69,0,0.3)",
                  "0 0 50px rgba(255,69,0,0.7)",
                  "0 0 20px rgba(255,69,0,0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Mic size={32} className="text-white" />
            </motion.div>
            <h2 className="font-display font-black text-4xl sm:text-5xl mb-3">
              Take the Hot Seat.
            </h2>
            <p className="text-muted mb-6 sm:mb-8 font-light">
              Free to start. Zero credit card. Just your ego on the line.
            </p>
            <button
              onClick={() => navigate("/login", { state: { mode: "signup" } })}
              className="btn-plasma px-10 sm:px-14 py-4 rounded-2xl font-semibold text-base sm:text-lg"
            >
              🔥 Get Roasted — It's Free
            </button>
          </div>
        </FadeUp>
      </section>

      <footer className="relative z-10 text-center py-8 text-xs text-muted/50 border-t border-white/5 font-mono">
        © 2025 Roastify · Powered by Groq LLaMA 3 · Built with 🔥
      </footer>
    </div>
  );
}
