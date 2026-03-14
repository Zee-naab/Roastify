import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic } from "lucide-react";
import { signupUser, loginUser, verifyOtp } from "../api/chat";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.state?.mode === "signup" ? "signup" : "login";

  const [mode, setMode] = useState(initialMode); // 'signup' | 'login'
  const [step, setStep] = useState("form"); // 'form' | 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  // If we navigate to /login with state.mode = 'signup', ensure
  // the component reflects that even if already mounted.
  useEffect(() => {
    if (location.state?.mode === "signup") {
      setMode("signup");
      setStep("form");
      setError("");
      setOtp("");
    }
  }, [location.state?.mode]);

  /* ── Step 1: Login or Signup ── */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        // Returning user: email + password → direct JWT
        const data = await loginUser(email, password);
        if (data.token) {
          localStorage.setItem("jwt", data.token);
          localStorage.setItem("user_email", email);
          navigate("/chat");
        } else {
          const detail = data.details ? ` (${data.details})` : "";
          setError((data.error || "Invalid email or password.") + detail);
        }
      } else {
        // New user: email + password → triggers OTP email
        const data = await signupUser(email, password);
        if (data.message || data.success) {
          setStep("otp");
        } else {
          const detail = data.details ? ` (${data.details})` : "";
          setError(
            (data.error || "Could not create account. Try signing in instead.") +
              detail,
          );
        }
      }
    } catch {
      setError("Cannot connect to server. Is Flask running?");
    } finally {
      setLoading(false);
    }
  }

  /* ── Step 2 (signup only): Verify OTP ── */
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await verifyOtp(email, otp);
      if (data.token) {
        localStorage.setItem("jwt", data.token);
        localStorage.setItem("user_email", email);
        navigate("/chat");
      } else {
        setError(data.error || "Invalid code. Please try again.");
      }
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setStep("form");
    setError("");
    setOtp("");
  }

  /* ── Headings ── */
  const heading =
    step === "otp"
      ? "Check your inbox."
      : isLogin
        ? "Welcome back."
        : "Get your backstage pass.";

  const subheading =
    step === "otp"
      ? `We emailed a 6-digit code to ${email}`
      : isLogin
        ? "Sign in with your email and password."
        : "Create your account — we'll verify your email.";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Plasma orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <motion.div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(138,43,226,0.2) 0%, transparent 65%)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,69,0,0.15) 0%, transparent 65%)",
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 btn-ghost px-3 py-2 rounded-xl flex items-center gap-2 text-sm z-10"
      >
        <ArrowLeft size={15} /> Home
      </button>

      <motion.div
        className="w-full max-w-[400px] relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="w-14 h-14 btn-plasma rounded-2xl flex items-center justify-center mx-auto mb-4"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <Mic size={26} className="text-white" />
          </motion.div>
          <h1 className="font-display font-black text-3xl tracking-tight mb-1 text-white">
            {heading}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{subheading}</p>
        </div>

        {/* Card */}
        <div className="liquid-raised rounded-2xl p-7 plasma-border">
          <AnimatePresence mode="wait">
            {/* ── OTP step (new accounts only) ── */}
            {step === "otp" ? (
              <motion.form
                key="otp"
                onSubmit={handleVerifyOtp}
                className="space-y-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <label
                    htmlFor="auth-otp"
                    className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2"
                  >
                    Your 6-digit code
                  </label>
                  <input
                    id="auth-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    placeholder="000000"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-3xl tracking-[0.5em] placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors font-mono"
                  />
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20"
                  >
                    {error}
                  </motion.p>
                )}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-plasma w-full py-3.5 rounded-xl text-base font-semibold"
                >
                  {loading ? "Verifying…" : "Verify & Enter the Hot Seat 🔥"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                    setError("");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors py-1"
                >
                  <ArrowLeft size={14} /> Use a different email
                </button>
              </motion.form>
            ) : (
              /* ── Login / Signup form ── */
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-base focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-base focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-plasma w-full py-3.5 rounded-xl text-base font-semibold"
                >
                  {loading
                    ? isLogin
                      ? "Signing in…"
                      : "Creating account…"
                    : isLogin
                      ? "Sign in →"
                      : "Create account & verify email →"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Mode switcher */}
        <div className="mt-5 text-center">
          {step === "form" && (
            <p className="text-sm text-gray-500">
              {isLogin ? "New here? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => switchMode(isLogin ? "signup" : "login")}
                className="text-orange-400 hover:text-orange-300 transition-colors font-medium underline underline-offset-2"
              >
                {isLogin ? "Create your backstage pass" : "Sign in instead"}
              </button>
            </p>
          )}
          <p className="text-xs text-gray-600 mt-3 font-mono">
            {isLogin
              ? "Returning members sign in with password."
              : "New members verify once via email."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
