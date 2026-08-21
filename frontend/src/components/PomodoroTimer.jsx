import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

// ─── Constants ───────────────────────────────────────────────────────────────
const MODES = {
  focus:  { label: "Odak",       minutes: 25, color: "#1a1a1a" },
  short:  { label: "Kısa Mola",  minutes: 5,  color: "#0F6E56" },
  long:   { label: "Uzun Mola",  minutes: 15, color: "#185FA5" },
};
const SESSIONS_PER_CYCLE = 4;
const CIRC = 2 * Math.PI * 44; // r=44 SVG ring circumference

// ─── Helper: format mm:ss ─────────────────────────────────────────────────────
const fmt = (secs) =>
  `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Circular SVG progress ring */
function TimerRing({ pct, color, children }) {
  const offset = CIRC * (1 - pct);
  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50" cy="50" r="44"
          className="fill-none stroke-gray-200 dark:stroke-gray-700"
          strokeWidth="4"
        />
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/** Session progress dots */
function SessionDots({ total, completed }) {
  return (
    <div className="flex gap-1.5 justify-center mt-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i < completed ? "bg-gray-800 dark:bg-gray-100 scale-110" : "bg-gray-200 dark:bg-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

/** Icon: Play */
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M5 3L13 8L5 13V3Z" fill="currentColor" />
  </svg>
);

/** Icon: Pause */
const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor" />
  </svg>
);

/** Icon: Skip */
const SkipIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 3L10 8L3 13V3Z" fill="currentColor" />
    <rect x="11" y="3" width="2" height="10" rx="1" fill="currentColor" />
  </svg>
);

/** Icon: Reset */
const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8C3 5.24 5.24 3 8 3C9.38 3 10.63 3.56 11.54 4.46L10 6H14V2L12.54 3.46C11.26 2.55 9.69 2 8 2C4.69 2 2 4.69 2 8H3Z" fill="currentColor" />
    <path d="M13 8C13 10.76 10.76 13 8 13C6.62 13 5.37 12.44 4.46 11.54L6 10H2V14L3.46 12.54C4.74 13.45 6.31 14 8 14C11.31 14 14 11.31 14 8H13Z" fill="currentColor" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * PomodoroTimer
 *
 * Props:
 *   activeTask   – { _id, title, description } | null  (from Dashboard)
 *   onSessionEnd – (sessionType: 'focus'|'short'|'long') => void
 *   onClose      – () => void   (to unmount/hide the panel)
 */
export default function PomodoroTimer({ activeTask = null, onSessionEnd, onClose }) {
  const [mode, setMode]               = useState("focus");
  const [remainSecs, setRemainSecs]   = useState(MODES.focus.minutes * 60);
  const [totalSecs, setTotalSecs]     = useState(MODES.focus.minutes * 60);
  const [running, setRunning]         = useState(false);
  const [completedSessions, setCompleted] = useState(0);
  const [statusMsg, setStatusMsg]     = useState("Odaklanmaya hazır");
  const intervalRef = useRef(null);

  // Update document title while running
  useEffect(() => {
    if (running) {
      document.title = `${fmt(remainSecs)} — ${MODES[mode].label} | Görevler`;
    } else {
      document.title = "Görev Yöneticisi";
    }
    return () => { document.title = "Görev Yöneticisi"; };
  }, [running, remainSecs, mode]);

  // Ticker
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemainSecs((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleSessionEnd = useCallback(() => {
    if (mode === "focus") {
      setCompleted((prev) => {
        const next = prev + 1;
        if (next >= SESSIONS_PER_CYCLE) {
          setStatusMsg("🎉 4 seans tamamlandı! Uzun mola zamanı.");
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          setTimeout(() => setCompleted(0), 800);
        } else {
          setStatusMsg(`Seans tamamlandı! (${next}/${SESSIONS_PER_CYCLE})`);
        }
        return next >= SESSIONS_PER_CYCLE ? 0 : next;
      });
    } else {
      setStatusMsg("Mola bitti, odaklanmaya devam!");
    }
    onSessionEnd?.(mode);
    // Browser notification (if permission granted)
    if (Notification.permission === "granted") {
      new Notification(
        mode === "focus" ? "Seans tamamlandı! 🍅" : "Mola bitti!",
        { body: mode === "focus" ? "Kısa bir mola hak ettin." : "Odaklanmaya devam." }
      );
    }
  }, [mode, onSessionEnd]);

  const switchMode = (newMode) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode(newMode);
    const secs = MODES[newMode].minutes * 60;
    setRemainSecs(secs);
    setTotalSecs(secs);
    setStatusMsg("Hazır");
  };

  const toggleTimer = () => {
    if (Notification.permission === "default") Notification.requestPermission();
    setRunning((prev) => {
      if (!prev) setStatusMsg(mode === "focus" ? "Odaklanıyor..." : "Dinleniyor...");
      else setStatusMsg("Duraklatıldı");
      return !prev;
    });
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setRemainSecs(totalSecs);
    setStatusMsg("Sıfırlandı");
  };

  const skipSession = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setRemainSecs(0);
    handleSessionEnd();
  };

  const pct = totalSecs > 0 ? remainSecs / totalSecs : 0;
  const modeColor = MODES[mode].color;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 w-full max-w-sm mx-auto select-none">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Pomodoro</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{statusMsg}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{completedSessions} / {SESSIONS_PER_CYCLE} seans</span>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1.5 mb-5">
        {Object.entries(MODES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
              mode === key
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100 font-medium"
                : "bg-transparent text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ring + time */}
      <TimerRing pct={pct} color={modeColor}>
        <span
          className="text-3xl font-medium tracking-tight"
          style={{ color: modeColor, transition: "color 0.3s ease" }}
        >
          {fmt(remainSecs)}
        </span>
        <span className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
          {MODES[mode].label}
        </span>
      </TimerRing>

      {/* Session dots */}
      <SessionDots total={SESSIONS_PER_CYCLE} completed={completedSessions} />

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-5">
        <button
          onClick={skipSession}
          title="Atla"
          className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <SkipIcon />
        </button>

        <button
          onClick={toggleTimer}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform active:scale-95"
          style={{ backgroundColor: modeColor }}
        >
          {running ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          onClick={resetTimer}
          title="Sıfırla"
          className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ResetIcon />
        </button>
      </div>

      {/* Active task */}
      {activeTask ? (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 mb-0.5">Aktif görev</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {activeTask.title}
          </p>
          {activeTask.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{activeTask.description}</p>
          )}
        </div>
      ) : (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400">Dashboard'dan bir görev seç</p>
        </div>
      )}
    </div>
  );
}
