import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// EMOTION CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const EMOTION_CONFIG = {
  happy:    { color: "#00FF9C", glow: "#00FF9C44", label: "Happy",    icon: "😊", desc: "Positive energy detected" },
  calm:     { color: "#00B4FF", glow: "#00B4FF44", label: "Calm",     icon: "😌", desc: "Peaceful state" },
  neutral:  { color: "#8888AA", glow: "#8888AA33", label: "Neutral",  icon: "😐", desc: "Balanced mood" },
  sad:      { color: "#6B8EFF", glow: "#6B8EFF44", label: "Sad",      icon: "😔", desc: "Low mood detected" },
  anxious:  { color: "#FFD700", glow: "#FFD70044", label: "Anxious",  icon: "😰", desc: "Elevated anxiety" },
  stressed: { color: "#C77DFF", glow: "#C77DFF44", label: "Stressed", icon: "😤", desc: "High stress levels" },
  angry:    { color: "#FF4D4D", glow: "#FF4D4D44", label: "Angry",    icon: "😠", desc: "Frustration detected" },
  tired:    { color: "#FF9F40", glow: "#FF9F4044", label: "Tired",    icon: "😴", desc: "Fatigue signs present" },
  confused: { color: "#FF6EC7", glow: "#FF6EC744", label: "Confused", icon: "😕", desc: "Processing challenges" },
};

const HOLO_EMOJIS = ["😌", "😊", "🧠", "💙", "✦", "😴", "🌟", "💫", "🎯"];

const MOOD_BARS = [
  { label: "😊 Happy",  pct: 72, color: "#00FF9C" },
  { label: "😌 Calm",   pct: 85, color: "#00B4FF" },
  { label: "😰 Anxious",pct: 24, color: "#FFD700" },
  { label: "😤 Stress", pct: 18, color: "#C77DFF" },
];

const STATS = [
  { val: 74, label: "Focus Score",  color: "#00B4FF" },
  { val: 81, label: "Wellness",     color: "#00FF9C" },
  { val: 38, label: "Fatigue",      color: "#FFD700" },
  { val: 92, label: "Calm",         color: "#C77DFF" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.45 + 0.08,
        hue: Math.random() * 60 + 185,
      });
    }

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.opacity})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,180,255,${0.07 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD STRENGTH
// ─────────────────────────────────────────────────────────────────────────────
function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[0-9]/.test(pw))          s++;
  if (/[^A-Za-z0-9]/.test(pw))   s++;
  const map = [
    { label: "Very Weak", color: "#FF4D4D", w: "15%" },
    { label: "Weak",      color: "#FF9F40", w: "35%" },
    { label: "Fair",      color: "#FFD700", w: "60%" },
    { label: "Good",      color: "#00B4FF", w: "80%" },
    { label: "Strong",    color: "#00FF9C", w: "100%" },
  ];
  return pw.length === 0 ? null : map[s] || map[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL — AUTH
// ─────────────────────────────────────────────────────────────────────────────
function AuthPanel({ onSuccess }) {
  const [tab, setTab]             = useState("login");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [name, setName]           = useState("");
  const [remember, setRemember]   = useState(false);
  const [bioPending, setBio]      = useState(null);
  const [loading, setLoading]     = useState(false);
  const [shake, setShake]         = useState(false);
  const [msg, setMsg]             = useState(null);
  const strength                  = getStrength(password);
  const isLogin                   = tab === "login";

  const handleSubmit = async () => {
    if (!email.includes("@")) { triggerShake("Please enter a valid email."); return; }
    if (password.length < 6)  { triggerShake("Password must be at least 6 characters."); return; }
    if (!isLogin && password !== confirm) { triggerShake("Passwords do not match."); return; }
    try {

  setLoading(true);

  const endpoint =
    isLogin
      ? "login"
      : "signup";

  const response = await fetch(

    `http://127.0.0.1:5000/api/auth/${endpoint}`,

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        name,
        email,
        password

      })

    }

  );

  const data = await response.json();

  setLoading(false);

  if (data.status === "success") {

    setMsg({
      type: "success",
      text: isLogin
        ? "Welcome back! Redirecting..."
        : "Account created successfully!"
    });

    localStorage.setItem(
      "mindmate-auth",
      "true"
    );

    localStorage.setItem(
      "mindmate-user",
      JSON.stringify(data.user || {})
    );

    setTimeout(() => {

      onSuccess && onSuccess();

    }, 1200);

  } else {

    triggerShake(data.message);

  }

} catch (error) {

  console.error(error);

  setLoading(false);

  triggerShake("Server Error");

}
  };

  const triggerShake = (text) => {
    setMsg({ type: "error", text });
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const biometricClick = (label) => {
    setBio(label);
    setTimeout(() => setBio(null), 2000);
  };

  return (
    <div style={styles.authPanel(shake)}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🧠</div>
        <div>
          <div style={styles.logoText}>MindMate AI</div>
          <div style={styles.logoSub}>Emotion Intelligence</div>
        </div>
      </div>

      {/* Heading */}
      <h1 style={styles.heading}>
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p style={styles.subheading}>
        {isLogin
          ? "Sign in to your wellness journey. We're glad you're here. 💙"
          : "Join MindMate AI and start your mental wellness journey today."}
      </p>

      {/* Tab switcher */}
      <div style={styles.tabs}>
        {["login", "signup"].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setMsg(null); }}
            style={styles.tab(tab === t)}
          >
            {t === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {/* Message */}
      {msg && (
        <div style={styles.msgBox(msg.type)}>
          {msg.type === "error" ? "⚠ " : "✓ "}{msg.text}
        </div>
      )}

      {/* Fields */}
      {!isLogin && (
        <Field label="Full Name" type="text" placeholder="Your full name" value={name} onChange={setName} icon="👤" />
      )}
      <Field label="Email Address" type="email" placeholder="your@email.com" value={email} onChange={setEmail} icon="✉" />
      <Field label="Password" type="password" placeholder="••••••••••••" value={password} onChange={setPassword} icon="🔒">
        {!isLogin && password.length > 0 && strength && (
          <div style={{ marginTop: 6 }}>
            <div style={styles.strengthTrack}>
              <div style={styles.strengthBar(strength)} />
            </div>
            <div style={{ fontSize: 10, color: strength.color, marginTop: 3, fontWeight: 600 }}>
              Strength: {strength.label}
            </div>
          </div>
        )}
      </Field>
      {!isLogin && (
        <Field label="Confirm Password" type="password" placeholder="••••••••••••" value={confirm} onChange={setConfirm} icon="🔒" />
      )}

      {/* Biometric row */}
      <div style={styles.bioRow}>
        {[
          { label: "Face ID",      icon: "🪪" },
          { label: "Voice Auth",   icon: "🎙" },
          { label: "Fingerprint",  icon: "👆" },
        ].map(b => (
          <button key={b.label} onClick={() => biometricClick(b.label)} style={styles.bioBtn(bioPending === b.label)}>
            <span style={{ fontSize: 20 }}>{b.icon}</span>
            <span style={{ fontSize: 11 }}>{bioPending === b.label ? "Scanning…" : b.label}</span>
          </button>
        ))}
      </div>

      {/* Main CTA */}
      <button onClick={handleSubmit} disabled={loading} style={styles.mainBtn(loading)}>
        {loading
          ? <LoadingDots />
          : `✦ ${isLogin ? "Sign In to MindMate" : "Create MindMate Account"}`}
      </button>

      {/* Divider */}
      <div style={styles.divider}>
        <div style={styles.dividerLine} />
        <span style={styles.dividerText}>or continue with</span>
        <div style={styles.dividerLine} />
      </div>

      {/* Social */}
      <div style={styles.socialRow}>
        <SocialBtn icon={<GoogleIcon />} label="Google" />
        <SocialBtn icon={<GitHubIcon />} label="GitHub" />
      </div>

      {/* Footer */}
      <div style={styles.authFooter}>
        <label style={styles.rememberLabel}>
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            style={{ accentColor: "#00B4FF", width: 14, height: 14, cursor: "pointer" }}
          />
          <span>Remember me</span>
        </label>
        <button
          onClick={() => setTab(isLogin ? "signup" : "login")}
          style={styles.linkBtn}
        >
          {isLogin ? "Forgot password?" : "Already have an account?"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange, icon, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.fieldInput(focused)}
        />
        <span style={styles.fieldIcon}>{icon}</span>
      </div>
      {children}
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      {[0, 0.15, 0.3].map((d, i) => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%", background: "#00B4FF",
            display: "inline-block",
            animation: `typingDot 1s ease-in-out ${d}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

function SocialBtn({ icon, label }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={styles.socialBtn(hover)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL — HOLOGRAPHIC DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function HoloDashboard() {
  const [emojiIdx, setEmojiIdx] = useState(0);
  const [fade, setFade]         = useState(true);
  const [liveEmotion]           = useState("calm");
  const cfg                     = EMOTION_CONFIG[liveEmotion];

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setEmojiIdx(i => (i + 1) % HOLO_EMOJIS.length);
        setFade(true);
      }, 300);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={styles.holoPanel}>
      {/* Ambient glow layer */}
      <div style={styles.holoGlow} />

      {/* Live tag */}
      <div style={styles.liveTag}>
        <span style={styles.liveDot} />
        Live Emotion AI
      </div>

      {/* Holographic orb */}
      <div style={styles.holoOrb}>
        <HoloRing size="100%" delay="0s"    dur="8s"  color="rgba(0,180,255,0.2)"   />
        <HoloRing size="84%"  delay="0.5s"  dur="12s" color="rgba(199,125,255,0.18)" reverse />
        <HoloRing size="68%"  delay="1s"    dur="17s" color="rgba(0,255,156,0.14)"  />
        <div style={styles.holoCenter(fade)}>
          {HOLO_EMOJIS[emojiIdx]}
        </div>
      </div>
      <div style={styles.neuralLabel}>Neural Emotional Model v4.6</div>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        {STATS.map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>
              {s.val}<span style={{ fontSize: 12, fontWeight: 500 }}>%</span>
            </div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mood bars */}
      <div style={styles.moodPanel}>
        <div style={styles.moodTitle}>Emotion Distribution</div>
        {MOOD_BARS.map(m => (
          <div key={m.label} style={styles.moodRow}>
            <div style={styles.moodLabel}>{m.label}</div>
            <div style={styles.moodTrack}>
              <div style={styles.moodFill(m.pct, m.color)} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: m.color, minWidth: 30, textAlign: "right" }}>
              {m.pct}%
            </div>
          </div>
        ))}
      </div>

      {/* Bottom feature badges */}
      <div style={styles.badgeRow}>
        {["9+ Emotions", "24/7 Support", "100% Private"].map(b => (
          <div key={b} style={styles.badge}>{b}</div>
        ))}
      </div>
    </div>
  );
}

function HoloRing({ size, delay, dur, color, reverse }) {
  return (
    <div style={{
      position: "absolute",
      width: size, height: size,
      top: "50%", left: "50%",
      transform: "translate(-50%,-50%)",
      borderRadius: "50%",
      border: `1px solid ${color}`,
      animation: `rotateRing ${dur} linear ${delay} infinite ${reverse ? "reverse" : "normal"}`,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG SOCIAL ICONS
// ─────────────────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = {
  authPanel: (shake) => ({
    width: "100%",
    maxWidth: 420,
    animation: shake ? "shakeX 0.4s ease" : undefined,
  }),
  logo: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 28,
  },
  logoIcon: {
    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
    background: "linear-gradient(135deg,rgba(0,180,255,0.35),rgba(199,125,255,0.35))",
    border: "1px solid rgba(0,180,255,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
  },
  logoText: { fontSize: 17, fontWeight: 800, color: "#e8e8f8", letterSpacing: 0.3 },
  logoSub:  { fontSize: 9, color: "#00B4FF", letterSpacing: 2, textTransform: "uppercase", marginTop: 2 },
  heading:  { fontSize: 28, fontWeight: 800, color: "#f0f0fa", lineHeight: 1.2, marginBottom: 6 },
  subheading: { fontSize: 13, color: "#6868a0", marginBottom: 24, lineHeight: 1.6 },
  tabs: {
    display: "flex", gap: 4,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 3, marginBottom: 20,
  },
  tab: (active) => ({
    flex: 1, padding: "9px 12px", textAlign: "center", borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
    fontFamily: "inherit", transition: "all 0.25s",
    background:    active ? "rgba(0,180,255,0.18)"      : "transparent",
    color:         active ? "#00B4FF"                   : "#6868a0",
    boxShadow:     active ? "0 0 12px rgba(0,180,255,0.15)" : "none",
    borderColor:   active ? "rgba(0,180,255,0.3)"       : "transparent",
    borderWidth:   1, borderStyle: "solid",
  }),
  msgBox: (type) => ({
    padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13,
    background: type === "error" ? "rgba(255,77,77,0.1)" : "rgba(0,255,156,0.1)",
    border: `1px solid ${type === "error" ? "rgba(255,77,77,0.3)" : "rgba(0,255,156,0.3)"}`,
    color:  type === "error" ? "#FF7070"  : "#00FF9C",
  }),
  fieldLabel: { fontSize: 11, color: "#5555aa", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 5, fontWeight: 600 },
  fieldInput: (focused) => ({
    width: "100%", background: focused ? "rgba(0,180,255,0.06)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${focused ? "rgba(0,180,255,0.5)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, padding: "11px 40px 11px 14px",
    fontSize: 13.5, color: "#e0e0f0", fontFamily: "inherit", outline: "none",
    transition: "all 0.25s",
  }),
  fieldIcon: { position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#444480", pointerEvents: "none" },
  strengthTrack: { height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" },
  strengthBar: (s) => ({ height: "100%", borderRadius: 2, width: s.w, background: s.color, transition: "all 0.4s" }),
  bioRow: { display: "flex", gap: 8, marginBottom: 18 },
  bioBtn: (active) => ({
    flex: 1, padding: "10px 6px",
    background: active ? "rgba(0,180,255,0.18)" : "rgba(255,255,255,0.04)",
    border:     `1px solid ${active ? "rgba(0,180,255,0.4)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, cursor: "pointer", textAlign: "center",
    transition: "all 0.25s", color: active ? "#00B4FF" : "#5555aa",
    fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
  }),
  mainBtn: (loading) => ({
    width: "100%", padding: "13px 20px",
    background: "linear-gradient(135deg,rgba(0,180,255,0.28),rgba(199,125,255,0.28))",
    border: "1px solid rgba(0,180,255,0.45)",
    borderRadius: 12, color: loading ? "#8888cc" : "#d8f0ff",
    fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
    letterSpacing: 0.5, fontFamily: "inherit",
    transition: "all 0.3s", marginBottom: 16,
    boxShadow: loading ? "none" : "0 0 24px rgba(0,180,255,0.15)",
  }),
  divider:     { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.07)" },
  dividerText: { fontSize: 11, color: "#333366" },
  socialRow:   { display: "flex", gap: 8, marginBottom: 18 },
  socialBtn: (hover) => ({
    flex: 1, padding: "9px 12px",
    background: hover ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${hover ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
    color: hover ? "#e0e0f0" : "#8888cc", fontFamily: "inherit",
    transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  }),
  authFooter:    { display: "flex", justifyContent: "space-between", alignItems: "center" },
  rememberLabel: { display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12, color: "#5555aa" },
  linkBtn: {
    background: "none", border: "none", color: "#00B4FF", cursor: "pointer",
    fontSize: 12, fontFamily: "inherit", padding: 0,
  },

  // Holo panel
  holoPanel: {
    width: "100%", height: "100%",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "32px 28px", gap: 0, position: "relative",
  },
  holoGlow: {
    position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(ellipse at 50% 30%,rgba(0,180,255,0.08),transparent 65%), radial-gradient(ellipse at 80% 80%,rgba(199,125,255,0.07),transparent 55%)",
  },
  liveTag: {
    fontSize: 10, padding: "4px 12px", borderRadius: 20, fontWeight: 700,
    background: "rgba(0,255,156,0.1)", color: "#00FF9C",
    border: "1px solid rgba(0,255,156,0.25)",
    display: "flex", alignItems: "center", gap: 6,
    letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 20,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: "50%", background: "#00FF9C",
    display: "inline-block",
    animation: "pulseDot 1.5s ease-in-out infinite",
  },
  holoOrb: { width: 200, height: 200, position: "relative", marginBottom: 8 },
  holoCenter: (fade) => ({
    position: "absolute", inset: "30%",
    borderRadius: "50%",
    background: "radial-gradient(circle at 38% 32%,rgba(0,180,255,0.3),rgba(199,125,255,0.18) 50%,rgba(3,7,17,0.8))",
    border: "1px solid rgba(0,180,255,0.28)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 36,
    animation: "floatOrb 4s ease-in-out infinite",
    opacity: fade ? 1 : 0,
    transition: "opacity 0.3s ease",
  }),
  neuralLabel: { fontSize: 10, color: "#333366", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 18 },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 280, marginBottom: 14 },
  statCard: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: "12px 14px", textAlign: "center",
  },
  statLabel: { fontSize: 10, color: "#555588", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 3 },
  moodPanel: {
    width: "100%", maxWidth: 280,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: "14px 16px", marginBottom: 14,
  },
  moodTitle: { fontSize: 10, color: "#444480", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600, marginBottom: 12 },
  moodRow:   { display: "flex", alignItems: "center", gap: 10, marginBottom: 9 },
  moodLabel: { fontSize: 11, color: "#6666aa", width: 70, flexShrink: 0 },
  moodTrack: { flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" },
  moodFill:  (pct, color) => ({ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 1.5s ease" }),
  badgeRow:  { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  badge: {
    fontSize: 10, padding: "4px 10px", borderRadius: 20, fontWeight: 600,
    background: "rgba(255,255,255,0.05)", color: "#5555aa",
    border: "1px solid rgba(255,255,255,0.1)", letterSpacing: 0.5,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL KEYFRAME STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  input::placeholder { color: #333366 !important; }
  @keyframes rotateRing    { from { transform: translate(-50%,-50%) rotate(0deg);   } to { transform: translate(-50%,-50%) rotate(360deg); } }
  @keyframes floatOrb      { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05) translateY(-4px); } }
  @keyframes pulseDot      { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.65); } }
  @keyframes shimmer       { 0% { transform:translateX(-100%); } 100% { transform:translateX(200%); } }
  @keyframes shakeX        { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
  @keyframes typingDot     { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-5px);opacity:1} }
  @keyframes fadeSlideUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanPulse     { 0%,100%{opacity:0.4} 50%{opacity:1} }
  ::-webkit-scrollbar            { width: 5px; height: 5px; }
  ::-webkit-scrollbar-thumb      { background: rgba(0,180,255,0.25); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover{ background: rgba(0,180,255,0.45); }
  ::-webkit-scrollbar-track      { background: rgba(255,255,255,0.03); border-radius: 10px; }
  * { scrollbar-width: thin; scrollbar-color: rgba(0,180,255,0.25) rgba(255,255,255,0.03); }
`;

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function MindMateAuth({
  onSuccess
}) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 820
  );

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 820);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#030711",
      fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      color: "#e0e0f0",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "stretch",
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* Particle background */}
      <ParticleCanvas />

      {/* Ambient background radials */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 15% 15%,rgba(0,180,255,0.07) 0%,transparent 55%), radial-gradient(ellipse at 85% 85%,rgba(199,125,255,0.07) 0%,transparent 55%), radial-gradient(ellipse at 50% 50%,rgba(0,255,156,0.03) 0%,transparent 70%)",
        transition: "all 2s ease",
      }} />

      {/* Main layout */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
      }}>
        {/* LEFT — Auth: scrollable column */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: isMobile ? "40px 20px 48px" : "48px 52px",
          position: "relative",
          animation: "fadeSlideUp 0.5s ease",
          overflowY: "auto",
          maxHeight: "100vh",
        }}>
          {/* inner spacer so content stays vertically centred on tall screens */}
          <div style={{
            width: "100%",
            maxWidth: 420,
            margin: "auto",
            paddingTop: 12,
            paddingBottom: 32,
          }}>
            <AuthPanel onSuccess={onSuccess} />
          </div>
        </div>

        {/* RIGHT — Holo dashboard (desktop only): scrollable column */}
        {!isMobile && (
          <div style={{
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            position: "relative",
            overflow: "hidden",
            overflowY: "auto",
            maxHeight: "100vh",
          }}>
            <HoloDashboard />
          </div>
        )}
      </div>
    </div>
  );
}