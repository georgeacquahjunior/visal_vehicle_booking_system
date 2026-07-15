import React from "react";
import { Info } from "lucide-react";

function InfoButton({ text }) {
  return (
    <button
      type="button"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400"
      title={text}
      aria-label={text}
    >
      <Info size={12} />
    </button>
  );
}

export default InfoButton;
