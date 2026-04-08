"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-600">
      <ArrowLeft size="14" /> Back to modules
    </Link>
  );
}

export default BackButton;
