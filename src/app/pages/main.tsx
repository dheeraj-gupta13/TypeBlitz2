"use client";

import { useState } from "react";
import TypingArea from "../components/typingArea";
import Header from "../components/header";

const DURATIONS = [15, 30, 60, 120];

export default function Editor() {
  const [duration, setDuration] = useState(15);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="mb-8 flex gap-1 rounded-full border border-gray-800 bg-gray-900/60 p-1">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${duration === d
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {d}s
            </button>
          ))}
        </div>

        {/* key={duration} forces a clean remount whenever the duration changes */}
        <TypingArea key={duration} duration={duration} />
      </main>
    </div>
  );
}