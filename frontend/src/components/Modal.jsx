import React, { useEffect } from "react";
import { createPortal } from "react-dom";

function Modal({ children, onClose, closeOnBackdrop = true }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex animate-fadeIn items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div className="animate-scaleIn" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
