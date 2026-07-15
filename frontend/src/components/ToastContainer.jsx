import React, { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { subscribeToast } from "../utils/toast.js";

const AUTO_DISMISS_MS = 5000;

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToast((toast) => {
      setToasts((current) => [...current, toast]);
      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, AUTO_DISMISS_MS);
    });
  }, []);

  const dismiss = (id) => setToasts((current) => current.filter((item) => item.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-5 top-5 z-[10000] flex w-[min(92vw,380px)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl animate-toastIn ${
            toast.type === "error" ? "border-rose-200" : "border-emerald-200"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          )}
          <p className="m-0 flex-1 text-sm font-semibold text-[#11233f]">{toast.message}</p>
          <button
            type="button"
            className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
