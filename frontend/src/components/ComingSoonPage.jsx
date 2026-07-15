import React from "react";
import InfoButton from "./InfoButton";
import useGreeting from "../hooks/useGreeting.js";

function ComingSoonPage({ title, description, icon: Icon }) {
  const { todayLabel } = useGreeting();

  return (
    <div className="text-[#11233f]">
      <section className="relative flex min-h-[200px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#eef3ff] p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="motion-reduce:animate-none absolute -left-14 -top-20 h-64 w-64 animate-floatA rounded-full bg-[#1d62bf]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -right-12 -top-14 h-56 w-56 animate-floatB rounded-full bg-[#c88810]/15 blur-3xl" />
          <div className="motion-reduce:animate-none absolute -bottom-24 left-1/3 h-60 w-60 animate-floatC rounded-full bg-[#1f8f63]/15 blur-3xl" />
          {Icon && <Icon size={160} className="absolute -bottom-8 left-4 text-blue-700/[0.05]" />}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#11233f]">{title}</h1>
            <InfoButton text={description} />
          </div>
          <p className="m-0 mt-1 text-sm text-[#7b8ba5]">{todayLabel}</p>
        </div>
      </section>

      <section className="mt-5 flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center">
        {Icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Icon size={26} />
          </div>
        )}
        <h2 className="m-0 text-xl font-bold text-[#11233f]">Coming soon</h2>
        <p className="m-0 max-w-md text-sm text-[#7b8ba5]">{description}</p>
      </section>
    </div>
  );
}

export default ComingSoonPage;
