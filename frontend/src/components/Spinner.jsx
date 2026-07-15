import React from "react";
import { Loader2 } from "lucide-react";

function Spinner({ size = 24, className = "" }) {
  return <Loader2 size={size} className={`animate-spin text-[#1469e1] ${className}`} aria-hidden="true" />;
}

export default Spinner;
