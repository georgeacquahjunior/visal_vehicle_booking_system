import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

function Breadcrumb({ items }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="m-0 flex list-none items-center gap-1.5 p-0">
        <li className="flex items-center gap-1.5 text-slate-400">
          <Home size={14} />
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5 text-slate-400">
              <ChevronRight size={14} className="shrink-0 text-[#c3ccd9]" />
              {isLast || !item.to ? (
                <span className="text-[13px] font-bold text-[#142d57]">{item.label}</span>
              ) : (
                <Link to={item.to} className="text-[13px] font-semibold text-slate-500 no-underline transition-colors hover:text-[#1469e1]">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
