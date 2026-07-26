"use client";

import { BiSolidKeyboard } from "react-icons/bi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { validateToken } from "../service/util";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(validateToken());
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    location.reload();
  };

  return (
    <header className="flex w-full items-center justify-between px-6 py-6 md:px-10">
      <Link href="/" className="flex items-center gap-2">
        <BiSolidKeyboard className="text-3xl text-blue-500" />
        <span className="text-2xl font-semibold tracking-wide text-white">
          Type<span className="text-blue-500">Blitz</span>
        </span>
      </Link>

      {loggedIn ? (
        <button
          onClick={handleLogOut}
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          Logout
        </button>
      ) : (
        <Link
          href="/login"
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          Login
        </Link>
      )}
    </header>
  );
}