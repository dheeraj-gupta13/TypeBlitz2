"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import Link from "next/link";
import { validateToken } from "../service/util";
import { getMaxSpeed, postTypingData } from "../service/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ConclusionProps {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  duration: number;
  wpmHistory: { t: number; wpm: number }[];
  onRestart: () => void;
}

export default function Conclusion({
  wpm,
  accuracy,
  correctChars,
  incorrectChars,
  duration,
  wpmHistory,
  onRestart,
}: ConclusionProps) {
  const [maxWpm, setMaxWpm] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const isLoggedIn = validateToken();
    setLoggedIn(isLoggedIn);
    if (!isLoggedIn) return;

    (async () => {
      try {
        await postTypingData({ wpm, accuracy });
        const res = await getMaxSpeed();
        setMaxWpm(res?.maxWpm ?? wpm);
      } catch (err) {
        setSaveError(true);
      }
    })();
    // Only run once, right after the test finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = {
    labels: wpmHistory.map((p) => `${p.t}s`),
    datasets: [
      {
        label: "WPM",
        data: wpmHistory.map((p) => p.wpm),
        fill: true,
        backgroundColor: "rgba(59,130,246,0.15)",
        borderColor: "#3b82f6",
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(255,255,255,0.05)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-10 text-gray-300">
      <div className="grid w-full grid-cols-2 gap-6 text-center md:grid-cols-4">
        <Stat label="wpm" value={wpm} highlight />
        <Stat label="accuracy" value={`${accuracy}%`} />
        <Stat label="time" value={`${duration}s`} />
        <Stat label="chars" value={`${correctChars}/${incorrectChars}`} />
      </div>

      {wpmHistory.length > 1 && (
        <div className="h-56 w-full rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <button
        onClick={onRestart}
        className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-400"
      >
        Try again
      </button>

      <div className="text-sm text-gray-500">
        {!loggedIn ? (
          <p>
            <Link className="text-blue-400 hover:underline" href="/login">
              Log in
            </Link>{" "}
            to save your progress and track your best score.
          </p>
        ) : saveError ? (
          <p>Couldn&apos;t save this result right now — check your connection.</p>
        ) : (
          <p>Best WPM: {maxWpm ?? wpm}</p>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs tracking-widest text-gray-500 uppercase">
        {label}
      </p>
      <p
        className={`text-4xl font-semibold ${highlight ? "text-blue-400" : "text-gray-200"
          }`}
      >
        {value}
      </p>
    </div>
  );
}