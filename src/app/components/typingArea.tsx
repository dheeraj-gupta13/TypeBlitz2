"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SAMPLE_PARAGRAPHS } from "../para/data";
import { FiRefreshCcw } from "react-icons/fi";
import { CiCircleRemove } from "react-icons/ci";
import Conclusion from "./conclusion";

const FONT_OPTIONS = [
  { label: "Mono", value: "font-mono" },
  { label: "Serif", value: "font-serif" },
  { label: "Sans", value: "font-sans" },
];

function pickParagraph(exclude?: string) {
  if (SAMPLE_PARAGRAPHS.length <= 1) return SAMPLE_PARAGRAPHS[0];
  let next = exclude;
  while (!next || next === exclude) {
    next =
      SAMPLE_PARAGRAPHS[Math.floor(Math.random() * SAMPLE_PARAGRAPHS.length)];
  }
  return next;
}

interface TypingAreaProps {
  duration: number;
}

export default function TypingArea({ duration }: TypingAreaProps) {
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [timerStarted, setTimerStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [fontFamily, setFontFamily] = useState("font-mono");
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const typedRef = useRef("");
  const wpmHistory = useRef<{ t: number; wpm: number }[]>([]);

  // Load a fresh paragraph + saved font preference on mount
  useEffect(() => {
    setText(pickParagraph());
    const savedFont = localStorage.getItem("font-family");
    if (savedFont) setFontFamily(savedFont);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    typedRef.current = typed;
  }, [typed]);

  const resetTest = useCallback(() => {
    setText((current) => pickParagraph(current));
    setTyped("");
    setTimeRemaining(duration);
    setTimerStarted(false);
    setFinished(false);
    wpmHistory.current = [];
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [duration]);

  // Countdown timer — independent of `typed` so it never drifts or resets mid-second
  useEffect(() => {
    if (!timerStarted || finished) return;

    const id = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;
        const elapsed = duration - next;
        const correct = typedRef.current
          .split("")
          .filter((c, i) => c === text[i]).length;
        const wpm = elapsed > 0 ? Math.round(correct / 5 / (elapsed / 60)) : 0;
        wpmHistory.current.push({ t: elapsed, wpm });
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [timerStarted, finished, duration, text]);

  // End the test once time runs out
  useEffect(() => {
    if (timerStarted && timeRemaining <= 0) {
      setFinished(true);
      setTimerStarted(false);
    }
  }, [timeRemaining, timerStarted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished || !text) return;
    let value = e.target.value;
    if (value.length > text.length) value = value.slice(0, text.length);

    if (!timerStarted && value.length > 0) setTimerStarted(true);
    setTyped(value);

    if (value.length === text.length) {
      setFinished(true);
      setTimerStarted(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      resetTest();
    }
  };

  const setFont = (value: string) => {
    setFontFamily(value);
    localStorage.setItem("font-family", value);
    setFontMenuOpen(false);
  };

  const elapsedSeconds = duration - timeRemaining;
  const correctChars = typed.split("").filter((c, i) => c === text[i]).length;
  const incorrectChars = typed.length - correctChars;
  const liveWpm =
    elapsedSeconds > 0 ? Math.round(correctChars / 5 / (elapsedSeconds / 60)) : 0;
  const liveAccuracy =
    typed.length > 0
      ? Math.round((correctChars / typed.length) * 1000) / 10
      : 100;

  if (finished) {
    return (
      <Conclusion
        wpm={liveWpm}
        accuracy={liveAccuracy}
        correctChars={correctChars}
        incorrectChars={incorrectChars}
        duration={duration}
        wpmHistory={wpmHistory.current}
        onRestart={resetTest}
      />
    );
  }

  return (
    <div className="w-full max-w-3xl">
      {/* Stat bar */}
      <div className="flex justify-between items-center text-xl mb-6 px-1">
        <span className="text-blue-400 font-semibold tabular-nums">
          {timeRemaining}s
        </span>
        <span className="text-gray-400 tabular-nums">
          {timerStarted ? `${liveWpm} wpm` : "ready"}
        </span>
      </div>

      {/* Typing area */}
      <div
        className="relative cursor-text rounded-xl border border-gray-800 bg-gray-900/40 p-6 md:p-8"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          value={typed}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={!text}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="absolute inset-0 z-10 cursor-text opacity-0"
          aria-label="Typing input"
        />

        <div
          className={`${fontFamily} pointer-events-none text-xl leading-relaxed tracking-wide transition select-none md:text-2xl ${isFocused ? "" : "blur-[3px]"
            }`}
        >
          {text ? (
            text.split("").map((char, i) => {
              let charClass = "text-gray-500";
              if (i < typed.length) {
                charClass =
                  typed[i] === char
                    ? "text-gray-200"
                    : "text-red-400 underline decoration-red-500/60";
              }
              const isCursor = i === typed.length;
              return (
                <span
                  key={i}
                  className={`${charClass} ${isCursor ? "animate-pulse border-l-2 border-blue-400" : ""
                    }`}
                >
                  {char}
                </span>
              );
            })
          ) : (
            <span className="text-gray-600">Loading…</span>
          )}
        </div>

        {!isFocused && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-950/50 text-sm text-gray-300">
            Click here or press any key to focus
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="mt-6 flex items-center justify-between px-1">
        <div className="relative">
          <button
            onClick={() => setFontMenuOpen((o) => !o)}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            {fontMenuOpen ? (
              <CiCircleRemove className="text-lg" />
            ) : (
              <span className={fontFamily}>Aa</span>
            )}
            <span>Font</span>
          </button>

          {fontMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 overflow-hidden rounded-lg border border-gray-800 bg-gray-900 shadow-xl">
              {FONT_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setFont(opt.value)}
                  className={`${opt.value} cursor-pointer px-4 py-2 text-sm hover:bg-gray-800 ${fontFamily === opt.value ? "text-blue-400" : "text-gray-300"
                    }`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={resetTest}
          className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          title="Restart (Tab)"
        >
          <FiRefreshCcw />
          Restart
        </button>
      </div>
    </div>
  );
}