import { useState, useEffect, useRef, useCallback } from "react";
import MoodAnalytics from "./components/MoodAnalytics";

// ── Color palette ──────────────────────────────────────────────────────────────
const EMOTION_CONFIG = {
  happy:    { color: "#00FF9C", glow: "#00FF9C44", label: "Happy",     icon: "😊", desc: "Positive energy detected" },
  calm:     { color: "#00B4FF", glow: "#00B4FF44", label: "Calm",      icon: "😌", desc: "Peaceful state" },
  neutral:  { color: "#8888AA", glow: "#8888AA33", label: "Neutral",   icon: "😐", desc: "Balanced mood" },
  sad:      { color: "#6B8EFF", glow: "#6B8EFF44", label: "Sad",       icon: "😔", desc: "Low mood detected" },
  anxious:  { color: "#FFD700", glow: "#FFD70044", label: "Anxious",   icon: "😰", desc: "Elevated anxiety" },
  stressed: { color: "#C77DFF", glow: "#C77DFF44", label: "Stressed",  icon: "😤", desc: "High stress levels" },
  angry:    { color: "#FF4D4D", glow: "#FF4D4D44", label: "Angry",     icon: "😠", desc: "Frustration detected" },
  tired:    { color: "#FF9F40", glow: "#FF9F4044", label: "Tired",     icon: "😴", desc: "Fatigue signs present" },
  confused: { color: "#FF6EC7", glow: "#FF6EC744", label: "Confused",  icon: "😕", desc: "Processing challenges" },
};

const WELLNESS_EXERCISES = [
  {
    id: "box-breathing",
    title: "Box Breathing",
    icon: "⬛",
    category: "Breathing",
    duration: "4 min",
    desc: "Military-grade stress relief technique",
    steps: ["Inhale for 4s", "Hold for 4s", "Exhale for 4s", "Hold for 4s"],
    color: "#00B4FF",
  },
  {
    id: "deep-breathing",
    title: "Deep Breathing",
    icon: "🌬️",
    category: "Breathing",
    duration: "3 min",
    desc: "Activate your parasympathetic nervous system",
    steps: ["Inhale deeply for 5s", "Hold for 2s", "Exhale slowly for 6s"],
    color: "#00FF9C",
  },
  {
    id: "neck-stretch",
    title: "Neck Stretch",
    icon: "🧘",
    category: "Movement",
    duration: "2 min",
    desc: "Release tension from long study sessions",
    steps: ["Tilt head right 30s", "Tilt head left 30s", "Roll neck slowly", "Repeat 3x"],
    color: "#C77DFF",
  },
  {
    id: "eye-relax",
    title: "Eye Relaxation",
    icon: "👁️",
    category: "Movement",
    duration: "2 min",
    desc: "20-20-20 rule for digital eye strain",
    steps: ["Look away from screen", "Focus on something 20ft away", "Hold for 20 seconds", "Blink 10 times"],
    color: "#FFD700",
  },
  {
    id: "pomodoro",
    title: "Pomodoro Focus",
    icon: "🍅",
    category: "Focus",
    duration: "25 min",
    desc: "Scientifically proven study technique",
    steps: ["Study for 25 minutes", "Short break 5 minutes", "Repeat 4 cycles", "Long break 15-30 min"],
    color: "#FF4D4D",
  },
  {
    id: "meditation",
    title: "Mindful Meditation",
    icon: "🧠",
    category: "Mindfulness",
    duration: "5 min",
    desc: "Ground yourself in the present moment",
    steps: ["Close eyes, sit comfortably", "Focus on your breath", "Notice thoughts without judgment", "Return to breath"],
    color: "#FF9F40",
  },
];

const MOOD_DATA = [
  { day: "Mon", score: 72, emotion: "calm" },
  { day: "Tue", score: 58, emotion: "stressed" },
  { day: "Wed", score: 81, emotion: "happy" },
  { day: "Thu", score: 45, emotion: "anxious" },
  { day: "Fri", score: 67, emotion: "neutral" },
  { day: "Sat", score: 88, emotion: "happy" },
  { day: "Sun", score: 76, emotion: "calm" },
];

// ── Animated Particle Background ───────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() * 60 + 180,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 180, 255, ${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

// ── Emotion Orb ───────────────────────────────────────────────────────────────
function EmotionOrb({ emotion, size = 120 }) {
  const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${cfg.color}88, ${cfg.color}11)`,
        border: `1.5px solid ${cfg.color}66`,
        boxShadow: `0 0 30px ${cfg.glow}, 0 0 60px ${cfg.glow}44, inset 0 0 20px ${cfg.color}22`,
        animation: "orbPulse 3s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: size * 0.36, userSelect: "none",
      }}>{cfg.icon}</div>
    </div>
  );
}

// ── Circular Meter ─────────────────────────────────────────────────────────────
function CircularMeter({ value, color, size = 60 }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff0f" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill={color} fontSize={10} fontWeight="700">
        {value}
      </text>
    </svg>
  );
}

// ── Webcam Emotion Detection Panel ────────────────────────────────────────────
function EmotionDetector({ currentEmotion, setCurrentEmotion }) {
  const videoRef = useRef(null);
  const camStreamRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [permission, setPermission] = useState("idle");
  const [confidence, setConfidence] = useState(87);
  const [attentionLevel, setAttentionLevel] = useState(72);
  const [stressLevel, setStressLevel] = useState(45);
  const [headDirection, setHeadDirection] = useState("Center");
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState(
    Object.keys(EMOTION_CONFIG).map(e => ({ emotion: e, val: Math.random() * 60 + 10 }))
  );
  const intervalRef = useRef(null);
  const cfg = EMOTION_CONFIG[currentEmotion] || EMOTION_CONFIG.neutral;

  const startCamera = async () => {
    setPermission("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      camStreamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setPermission("granted"); setStreaming(true);
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 320;
        canvas.height = videoRef.current.videoHeight || 240;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0);
        const image = canvas.toDataURL("image/jpeg");
        try {
          const response = await fetch("http://127.0.0.1:10000/api/emotion/detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image }),
          });
          const data = await response.json();
          setCurrentEmotion(data.emotion);
          setConfidence(Math.round(data.confidence));
          setAttentionLevel(data.attention_level || 0);
          setStressLevel(data.fatigue_level || 0);
          setHeadDirection(data.head_direction || "Center");
          setBlinkDetected(data.blink_detected || false);
          if (data.emotion_scores) {
          setEmotionHistory(
          Object.entries(
          data.emotion_scores
    ).map(([emotion, value]) => ({

      emotion: emotion.toLowerCase(),

      val: Math.round(value)
    }))
  );
}
        } catch (error) {
          console.log("Emotion Detection Error:", error);
        }
      }, 2500);
    } catch {
      setPermission("denied");
    }
  };

  const stopCamera = () => {
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach(t => t.stop());
      camStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    clearInterval(intervalRef.current);
    setStreaming(false); setPermission("idle");
  };

  useEffect(() => () => { stopCamera(); }, []);

  // Responsive: detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 900;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 280px",
      gap: 20,
      height: isMobile ? "auto" : "100%",
    }}>
      {/* Camera Panel */}
      <div style={{
        position: "relative", borderRadius: 20, overflow: "hidden",
        background: "#050810", border: `1.5px solid ${cfg.color}44`,
        boxShadow: `0 0 40px ${cfg.glow}`,
        transition: "border-color 0.8s, box-shadow 0.8s",
        minHeight: isMobile ? 260 : 420,
        height: isMobile ? 260 : "100%",
      }}>
        {["tl", "tr", "bl", "br"].map(c => (
          <div key={c} style={{
            position: "absolute", width: 24, height: 24, zIndex: 10,
            top: c.startsWith("t") ? 12 : "auto", bottom: c.startsWith("b") ? 12 : "auto",
            left: c.endsWith("l") ? 12 : "auto", right: c.endsWith("r") ? 12 : "auto",
            borderTop: c.startsWith("t") ? `2px solid ${cfg.color}` : "none",
            borderBottom: c.startsWith("b") ? `2px solid ${cfg.color}` : "none",
            borderLeft: c.endsWith("l") ? `2px solid ${cfg.color}` : "none",
            borderRight: c.endsWith("r") ? `2px solid ${cfg.color}` : "none",
            borderTopLeftRadius: c === "tl" ? 8 : 0, borderTopRightRadius: c === "tr" ? 8 : 0,
            borderBottomLeftRadius: c === "bl" ? 8 : 0, borderBottomRightRadius: c === "br" ? 8 : 0,
          }} />
        ))}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: streaming ? 1 : 0, transform: "scaleX(-1)", display: "block" }}
        />
        {!streaming && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <EmotionOrb emotion={currentEmotion} size={isMobile ? 70 : 100} />
            <div style={{ fontSize: 13, color: "#8888aa", textAlign: "center", padding: "0 20px" }}>
              {permission === "denied" ? "Camera access denied. Check browser permissions." :
               permission === "requesting" ? "Requesting camera access..." :
               "Enable camera for real-time emotion detection"}
            </div>
            {permission !== "requesting" && (
              <button onClick={startCamera} style={btnStyle(cfg.color)}>
                {permission === "denied" ? "Retry Access" : "▶ Start Detection"}
              </button>
            )}
          </div>
        )}
        {streaming && (
          <>
            <div style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
              animation: "scanLine 2.5s linear infinite",
              boxShadow: `0 0 8px ${cfg.color}`,
            }} />
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{
                background: "#00000088", backdropFilter: "blur(10px)",
                border: `1px solid ${cfg.color}44`, borderRadius: 12, padding: "8px 14px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`, animation: "blink 1s infinite" }} />
                <span style={{ color: cfg.color, fontWeight: 600, fontSize: 13 }}>LIVE</span>
                <span style={{ color: "#ccc", fontSize: 13 }}>{cfg.label}</span>
              </div>
              <div style={{ background: "#00000088", backdropFilter: "blur(10px)", border: `1px solid ${cfg.color}44`, borderRadius: 12, padding: "8px 14px" }}>
                <span style={{ color: cfg.color, fontWeight: 700, fontSize: 15 }}>{confidence}%</span>
                <span style={{ color: "#888", fontSize: 12, marginLeft: 4 }}>confidence</span>
              </div>
            </div>
            <button onClick={stopCamera} style={{ position: "absolute", top: 12, right: 44, background: "#ff4d4d22", border: "1px solid #ff4d4d44", color: "#ff4d4d", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>■ Stop</button>
          </>
        )}
      </div>

      {/* Analytics Panel */}
      <div style={{
        display: isMobile ? "grid" : "flex",
        gridTemplateColumns: isMobile ? "1fr 1fr" : undefined,
        flexDirection: isMobile ? undefined : "column",
        gap: 14,
        overflowY: isMobile ? "visible" : "auto",
        maxHeight: isMobile ? "none" : 420,
      }}>
        {/* Current emotion card */}
        <div style={glassCard(cfg.color + "22")}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <EmotionOrb emotion={currentEmotion} size={isMobile ? 44 : 56} />
            <div>
              <div style={{ fontSize: 11, color: "#8888aa", textTransform: "uppercase", letterSpacing: 2 }}>Detected Emotion</div>
              <div style={{ fontSize: isMobile ? 16 : 22, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
              <div style={{ fontSize: 12, color: "#aaaacc" }}>{cfg.desc}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#8888aa", marginBottom: 6 }}>Confidence Level</div>
          <div style={{ background: "#ffffff0f", borderRadius: 6, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${confidence}%`, height: "100%", background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`, borderRadius: 6, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: cfg.color, marginTop: 4 }}>{confidence}%</div>
        </div>

        {/* Emotion Radar */}
        <div style={glassCard()}>
          <div style={{ fontSize: 11, color: "#8888aa", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Emotion Analysis</div>
          {emotionHistory.slice(0, 6).map(({ emotion, val }) => {
            const c = EMOTION_CONFIG[emotion];
            return (
              <div key={emotion} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: emotion === currentEmotion ? c.color : "#888" }}>{c.icon} {c.label}</span>
                  <span style={{ color: "#666" }}>{Math.round(val)}%</span>
                </div>
                <div style={{ background: "#ffffff0a", borderRadius: 4, height: 4 }}>
                  <div style={{ width: `${val}%`, height: "100%", background: emotion === currentEmotion ? c.color : "#ffffff22", borderRadius: 4, transition: "width 0.8s, background 0.8s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Biometric Signals */}
        <div style={glassCard()}>
          <div style={{ fontSize: 11, color: "#8888aa", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Biometric Signals</div>
          {[
            { label: "Attention Level", val: attentionLevel, color: "#00FF9C" },
            { label: "Fatigue Index", val: stressLevel, color: "#FFD700" },
            { label: "Confidence", val: confidence, color: "#00B4FF" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <CircularMeter value={val} color={color} size={42} />
              <div>
                <div style={{ fontSize: 12, color: "#aaa" }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color }}>{val}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Face Tracking AI */}
        <div style={glassCard()}>
          <div style={{ fontSize: 11, color: "#8888aa", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Face Tracking AI</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#ffffff08", padding: 12, borderRadius: 10, border: "1px solid #ffffff10", fontSize: 13 }}>
              🧭 Head Direction:
              <span style={{ color: cfg.color, marginLeft: 8, fontWeight: 700 }}>{headDirection}</span>
            </div>
            <div style={{ background: "#ffffff08", padding: 12, borderRadius: 10, border: "1px solid #ffffff10", fontSize: 13 }}>
              😉 Blink Detection:
              <span style={{ color: blinkDetected ? "#00FF9C" : "#888", marginLeft: 8, fontWeight: 700 }}>
                {blinkDetected ? "Blinking" : "Eyes Open"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI Chatbot ────────────────────────────────────────────────────────────────
function Chatbot({ currentEmotion }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm MindMate, your AI wellness companion 💙 How are you feeling today? I can see you and I'm here to help.", ts: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const bottomRef = useRef(null);
  const cfg = EMOTION_CONFIG[currentEmotion] || EMOTION_CONFIG.neutral;

  const QUICK_REPLIES = [
    "I'm feeling stressed about exams",
    "I can't focus on studying",
    "I feel burnt out",
    "Guide me through breathing",
  ];

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:10000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({message: text,emotion: currentEmotion,history: messages}),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "I'm here for you 💙", ts: new Date() }]);
    } catch (error) {
      console.log(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Please try again.", ts: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, currentEmotion]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 400 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <EmotionOrb emotion={currentEmotion} size={44} />
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#e8e8f8" }}>MindMate AI</div>
          <div style={{ fontSize: 12, color: "#00FF9C", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF9C", animation: "blink 1.5s infinite" }} />
            Emotion-aware • Always here for you
          </div>
        </div>
        <div style={{ background: cfg.color + "22", border: `1px solid ${cfg.color}44`, borderRadius: 10, padding: "4px 10px", fontSize: 12, color: cfg.color }}>
          {cfg.icon} {cfg.label}
        </div>
        <button onClick={() => setVoiceMode(!voiceMode)} style={{
          background: voiceMode ? "#C77DFF22" : "transparent",
          border: `1px solid ${voiceMode ? "#C77DFF" : "#ffffff22"}`,
          color: voiceMode ? "#C77DFF" : "#888",
          borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "inherit",
        }}>🎤 Voice</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4, paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${cfg.color}88, #050810)`, border: `1px solid ${cfg.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
            )}
            <div style={{
              maxWidth: "72%", padding: "10px 14px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? `linear-gradient(135deg, ${cfg.color}44, ${cfg.color}22)` : "#ffffff0a",
              border: m.role === "user" ? `1px solid ${cfg.color}44` : "1px solid #ffffff15",
              fontSize: 14, color: "#e0e0f0", lineHeight: 1.6,
            }}>
              {m.content}
              <div style={{ fontSize: 10, color: "#555", marginTop: 4, textAlign: "right" }}>
                {m.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ffffff0a", border: "1px solid #ffffff15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
            <div style={{ padding: "12px 16px", background: "#ffffff0a", border: "1px solid #ffffff15", borderRadius: "18px 18px 18px 4px", display: "flex", gap: 6 }}>
              {[0.1, 0.2, 0.3].map(d => (
                <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, animation: `typingDot 1s ease-in-out ${d}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10, marginTop: 6, paddingBottom: 4, scrollbarWidth: "none" }}>
        {QUICK_REPLIES.map(r => (
          <button key={r} onClick={() => sendMessage(r)} style={{
            background: "#ffffff08", border: "1px solid #ffffff1a", color: "#aaa",
            borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer",
            transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
          }}
            onMouseEnter={e => { e.target.style.background = cfg.color + "22"; e.target.style.color = cfg.color; e.target.style.borderColor = cfg.color + "44"; }}
            onMouseLeave={e => { e.target.style.background = "#ffffff08"; e.target.style.color = "#aaa"; e.target.style.borderColor = "#ffffff1a"; }}>
            {r}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, background: "#ffffff0a", border: `1px solid ${cfg.color}33`, borderRadius: 16, padding: "8px 8px 8px 16px" }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Share what's on your mind..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e0e0f0", fontSize: 14, fontFamily: "inherit", minWidth: 0 }}
        />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{
          background: input.trim() && !loading ? cfg.color : "#ffffff0a",
          border: "none", borderRadius: 12, padding: "8px 14px",
          cursor: input.trim() && !loading ? "pointer" : "not-allowed",
          color: input.trim() && !loading ? "#000" : "#555",
          fontWeight: 600, fontSize: 14, transition: "all 0.2s", flexShrink: 0, fontFamily: "inherit",
        }}>➤</button>
      </div>
    </div>
  );
}

// ── Wellness Exercise Panel ───────────────────────────────────────────────────
function WellnessPanel() {
  const [active, setActive] = useState(null);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Breathing", "Movement", "Focus", "Mindfulness"];
  const filtered = filter === "All" ? WELLNESS_EXERCISES : WELLNESS_EXERCISES.filter(e => e.category === filter);

  useEffect(() => {
    if (!running || !active) return;
    const id = setInterval(() => setTimer(t => {
      if (t <= 1) { setStepIdx(i => (i + 1) % active.steps.length); return 10; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running, active]);

  const startExercise = (ex) => { setActive(ex); setTimer(10); setStepIdx(0); setRunning(false); };

  return (
    <div>
      {/* Category Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            background: filter === c ? "#00B4FF22" : "transparent",
            border: `1px solid ${filter === c ? "#00B4FF" : "#ffffff22"}`,
            color: filter === c ? "#00B4FF" : "#888",
            borderRadius: 20, padding: "6px 14px", fontSize: 13, cursor: "pointer",
            transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
          }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {filtered.map(ex => (
          <div key={ex.id} onClick={() => startExercise(ex)} style={{
            ...glassCard(ex.color + "11"),
            cursor: "pointer", transition: "all 0.25s", position: "relative", overflow: "hidden",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 30px ${ex.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{ex.icon}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#e8e8f8" }}>{ex.title}</div>
              <span style={{ background: ex.color + "22", color: ex.color, fontSize: 11, borderRadius: 6, padding: "2px 8px", flexShrink: 0, marginLeft: 6 }}>{ex.duration}</span>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{ex.desc}</div>
            <div style={{ fontSize: 11, color: ex.color + "aa" }}>{ex.category}</div>
          </div>
        ))}
      </div>

      {/* Active Exercise Modal */}
      {active && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
        }} onClick={e => { if (e.target === e.currentTarget) { setActive(null); setRunning(false); } }}>
          <div style={{
            background: "#0a0f1e", border: `1.5px solid ${active.color}44`, borderRadius: 24,
            padding: "clamp(20px, 5vw, 36px)", width: "min(400px, 100%)",
            boxShadow: `0 0 60px ${active.color}33`, textAlign: "center",
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{active.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#e8e8f8", marginBottom: 6 }}>{active.title}</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>{active.desc}</div>
            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 20px" }}>
              <CircularMeter value={timer * 10} color={active.color} size={120} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: active.color }}>{timer}s</div>
              </div>
            </div>
            <div style={{ background: active.color + "11", border: `1px solid ${active.color}33`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Step {stepIdx + 1} of {active.steps.length}
              </div>
              <div style={{ fontSize: 16, color: active.color, fontWeight: 600 }}>{active.steps[stepIdx]}</div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setRunning(!running)} style={btnStyle(active.color)}>
                {running ? "⏸ Pause" : "▶ Start"}
              </button>
              <button onClick={() => { setActive(null); setRunning(false); }} style={{
                background: "transparent", border: "1px solid #ffffff22", color: "#888",
                borderRadius: 12, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontFamily: "inherit",
              }}>✕ Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mood Analytics Dashboard ───────────────────────────────────────────────────
function Dashboard({ currentEmotion }) {
  const cfg = EMOTION_CONFIG[currentEmotion] || EMOTION_CONFIG.neutral;
  const avgScore = Math.round(MOOD_DATA.reduce((s, d) => s + d.score, 0) / MOOD_DATA.length);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
        {[
          { label: "Avg Wellness", value: avgScore + "%", icon: "📊", color: "#00B4FF" },
          { label: "Best Day", value: "Saturday", icon: "🌟", color: "#FFD700" },
          { label: "Streak", value: "7 Days", icon: "🔥", color: "#FF9F40" },
          { label: "Sessions", value: "23", icon: "🧠", color: "#00FF9C" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ ...glassCard(color + "11"), textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Weekly mood chart */}
      <div style={glassCard()}>
        <div style={{ fontSize: 11, color: "#8888aa", textTransform: "uppercase", letterSpacing: 2, marginBottom: 20 }}>Weekly Wellness Timeline</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
          {MOOD_DATA.map(({ day, score, emotion }) => {
            const c = EMOTION_CONFIG[emotion];
            return (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, color: c.color }}>{score}%</div>
                <div style={{
                  width: "100%", borderRadius: "6px 6px 0 0",
                  height: `${(score / 100) * 110}px`,
                  background: `linear-gradient(180deg, ${c.color}, ${c.color}44)`,
                  boxShadow: `0 0 10px ${c.glow}`,
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent, #00000044)" }} />
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>{day}</div>
                <div style={{ fontSize: 14 }}>{c.icon}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emotion distribution + Focus score */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        <div style={glassCard()}>
          <div style={{ fontSize: 11, color: "#8888aa", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Emotion Distribution</div>
          {[
            { label: "Positive", pct: 48, color: "#00FF9C" },
            { label: "Neutral", pct: 23, color: "#8888AA" },
            { label: "Stressed", pct: 17, color: "#C77DFF" },
            { label: "Anxious", pct: 12, color: "#FFD700" },
          ].map(({ label, pct, color }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#ccc" }}>
                <span>{label}</span><span style={{ color }}>{pct}%</span>
              </div>
              <div style={{ background: "#ffffff0a", borderRadius: 6, height: 8 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 6, boxShadow: `0 0 8px ${color}66` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={glassCard()}>
          <div style={{ fontSize: 11, color: "#8888aa", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Current Status</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Focus", val: 74, color: "#00B4FF" },
              { label: "Energy", val: 62, color: "#FFD700" },
              { label: "Mood", val: 81, color: "#00FF9C" },
              { label: "Calm", val: 58, color: "#C77DFF" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <CircularMeter value={val} color={color} size={70} />
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, background: "#00FF9C0f", border: "1px solid #00FF9C22", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#00FF9C" }}>
            🌟 You're doing great! Keep up the momentum.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Utility style functions ────────────────────────────────────────────────────
function glassCard(bg = "#ffffff05") {
  return {
    background: bg,
    border: "1px solid #ffffff10",
    borderRadius: 16,
    padding: 18,
    backdropFilter: "blur(10px)",
  };
}

function btnStyle(color) {
  return {
    background: color + "22", border: `1px solid ${color}66`, color,
    borderRadius: 12, padding: "10px 22px", cursor: "pointer",
    fontSize: 14, fontWeight: 600, transition: "all 0.2s", fontFamily: "inherit",
  };
}

// ── Bottom Navigation (Mobile) ─────────────────────────────────────────────────
function BottomNav({ tabs, currentTab, setTab, cfg }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#08101eee", backdropFilter: "blur(20px)",
      borderTop: "1px solid #ffffff0d", zIndex: 100,
      padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
    }}>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "6px 10px", border: "none", background: "transparent",
            color: currentTab === t.id ? cfg.color : "#8888aa",
            cursor: "pointer", borderRadius: 10, transition: "all 0.2s",
            fontFamily: "inherit", minWidth: 52,
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.3 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── Home Page ──────────────────────────────────────────────────────────────────
function HomePage({ cfg, setTab, currentEmotion }) {
  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease" }}>
      <div style={{
        ...glassCard(cfg.color + "08"),
        padding: "clamp(20px, 5vw, 40px)", marginBottom: 24,
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${cfg.color}11, transparent 70%)` }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, animation: "float 4s ease-in-out infinite" }}>
            <EmotionOrb emotion={currentEmotion} size={90} />
          </div>
          <h1 style={{
            fontSize: "clamp(24px, 6vw, 38px)", fontWeight: 900, marginBottom: 8,
            background: `linear-gradient(135deg, #ffffff, ${cfg.color})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>MindMate AI</h1>
          <p style={{ fontSize: "clamp(13px, 2.5vw, 16px)", color: "#8888cc", marginBottom: 28, maxWidth: 500, margin: "0 auto 28px" }}>
            Your intelligent mental wellness companion. Emotion-aware, always compassionate, built for students.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setTab("detect")} style={btnStyle(cfg.color)}>🎥 Start Emotion Detection</button>
            <button onClick={() => setTab("chat")} style={btnStyle("#C77DFF")}>🤖 Talk to MindMate</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        {[
          { icon: "🎥", title: "Emotion AI", desc: "Real-time facial emotion detection", tab: "detect", color: "#00B4FF" },
          { icon: "🤖", title: "AI Therapist", desc: "Emotion-aware chatbot", tab: "chat", color: "#C77DFF" },
          { icon: "🧘", title: "Wellness Hub", desc: "Breathing & focus techniques", tab: "wellness", color: "#00FF9C" },
          { icon: "📊", title: "Analytics", desc: "Track mood trends", tab: "dashboard", color: "#FFD700" },
        ].map(({ icon, title, desc, tab: t, color }) => (
          <div key={t} onClick={() => setTab(t)} style={{
            ...glassCard(color + "0a"), cursor: "pointer",
            transition: "all 0.25s", textAlign: "center",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = color + "44"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#ffffff10"; }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#e8e8f8", marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#8888aa" }}>{desc}</div>
          </div>
        ))}
      </div>

      <div style={{ ...glassCard(), marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 12 }}>
          {[
            { val: "9+", label: "Emotions Detected" },
            { val: "24/7", label: "AI Support" },
            { val: "6+", label: "Wellness Exercises" },
            { val: "100%", label: "Private & Secure" },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "center", padding: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{val}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section Wrapper ────────────────────────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 800, color: "#e8e8f8", marginBottom: 4 }}>{title}</h1>
        <p style={{ fontSize: 14, color: "#8888aa" }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function MindMateApp() {
  const [tab, setTab] = useState("home");
  const [currentEmotion, setCurrentEmotion] = useState("calm");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 900
  );
  const cfg = EMOTION_CONFIG[currentEmotion] || EMOTION_CONFIG.calm;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSetTab = (newTab) => {
    setTab(newTab);
    window.scrollTo && window.scrollTo(0, 0);
  };

  const TABS = [
    { id: "home",      label: "Home",    icon: "✦" },
    { id: "detect",    label: "Emotion", icon: "🎥" },
    { id: "chat",      label: "Chat",    icon: "🤖" },
    { id: "wellness",  label: "Wellness",icon: "🧘" },
    { id: "dashboard", label: "Analytics",icon: "📊" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "#050810",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#e0e0f0",
      position: "relative",
      display: "flex",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: #ffffff15; border-radius: 4px; }
        * { scrollbar-width: thin; scrollbar-color: #ffffff15 transparent; }
        @keyframes orbPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: 0.85; } }
        @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes typingDot { 0%,100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-5px); opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: #555; }
        button { font-family: inherit; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* Particle background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <ParticleField />
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 20% 20%, ${cfg.color}08 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #C77DFF08 0%, transparent 60%)`,
          transition: "background 1.5s ease",
        }} />
      </div>

      {/* ── Desktop Sidebar ── */}
      {!isMobile && (
        <nav style={{
          width: 220, background: "#08101ecc", backdropFilter: "blur(20px)",
          borderRight: "1px solid #ffffff0d", display: "flex", flexDirection: "column",
          padding: "24px 12px", gap: 4, flexShrink: 0, position: "relative", zIndex: 10,
        }}>
          {/* Logo */}
          <div style={{ padding: "0 12px", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: `linear-gradient(135deg, ${cfg.color}44, #C77DFF44)`,
                border: `1px solid ${cfg.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>🧠</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#e8e8f8", letterSpacing: 0.5 }}>MindMate</div>
                <div style={{ fontSize: 10, color: cfg.color, letterSpacing: 1.5, textTransform: "uppercase" }}>AI</div>
              </div>
            </div>
          </div>

          {TABS.map(t => (
            <button key={t.id} onClick={() => handleSetTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
              background: tab === t.id ? cfg.color + "18" : "transparent",
              color: tab === t.id ? cfg.color : "#8888aa",
              fontSize: 14, fontWeight: tab === t.id ? 600 : 400,
              borderLeft: tab === t.id ? `3px solid ${cfg.color}` : "3px solid transparent",
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {t.id === "detect" ? "Emotion AI" : t.id === "dashboard" ? "Analytics" : t.label}
            </button>
          ))}

          {/* ── Logout Button ── */}
          <button
            onClick={() => {
              localStorage.removeItem("mindmate-auth");
              localStorage.removeItem("mindmate-user");
              window.location.reload();
            }}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255,77,77,0.25)",
              background: "rgba(255,77,77,0.08)",
              color: "#FF6B6B",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,77,77,0.16)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,77,77,0.08)";
              e.target.style.transform = "translateY(0px)";
            }}
          >
            🚪 Logout
          </button>

          <div style={{ flex: 1 }} />

          {/* Emotion indicator */}
          <div style={{ padding: "12px 14px", background: "#ffffff05", borderRadius: 12, border: "1px solid #ffffff0d" }}>
            <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Current State</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
              <span style={{ color: cfg.color, fontSize: 13, fontWeight: 600 }}>{cfg.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 16 }}>{cfg.icon}</span>
            </div>
          </div>
        </nav>
      )}

      {/* ── Main Content ── */}
      <main style={{
        flex: 1, overflowY: "auto", padding: isMobile ? "16px 12px" : 28,
        paddingBottom: isMobile ? 80 : 28,
        position: "relative", zIndex: 1,
      }}>
        {tab === "home" && <HomePage cfg={cfg} setTab={handleSetTab} currentEmotion={currentEmotion} />}
        {tab === "detect" && (
          <Section title="Emotion Detection AI" subtitle="Real-time facial emotion analysis powered by computer vision">
            <div style={{ height: isMobile ? "auto" : 420 }}>
              <EmotionDetector currentEmotion={currentEmotion} setCurrentEmotion={setCurrentEmotion} />
            </div>
          </Section>
        )}
        {tab === "chat" && (
          <Section title="MindMate Chat" subtitle="Your compassionate AI mental wellness companion">
            <div style={{ height: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 180px)" }}>
              <Chatbot currentEmotion={currentEmotion} />
            </div>
          </Section>
        )}
        {tab === "wellness" && (
          <Section title="Wellness Exercises" subtitle="Science-backed techniques to reduce stress and boost focus">
            <WellnessPanel />
          </Section>
        )}
        {tab === "dashboard" && (
          <Section title="Mood Analytics" subtitle="Insights into your emotional wellbeing over time">
            <MoodAnalytics />
          </Section>
        )}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      {isMobile && (
        <BottomNav tabs={TABS} currentTab={tab} setTab={handleSetTab} cfg={cfg} />
      )}
    </div>
  );
}