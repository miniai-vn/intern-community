"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`
        fixed bottom-6 right-6
        bg-blue-600 text-white
        px-4 py-2 rounded-full shadow
        transition-opacity duration-300
        hover:bg-blue-700
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      ↑
    </button>
  );
}