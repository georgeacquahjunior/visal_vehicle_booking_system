import Modal from "./Modal";

const BookingModal = ({ message, onClose, type = "error" }) => {
  if (!message) return null;

  const title = type === "error" ? "Error" : "Success";
  const icon = type === "error" ? <i style={{ color: "red" }} className="fa-solid fa-ban"></i> : <i style={{ color: "green" }} className="fa-regular fa-circle-check"></i>;
  const accentClass = type === "error" ? "border-l-[5px] border-l-red-600" : "border-l-[5px] border-l-green-600";

  return (
    <Modal onClose={onClose}>
      <div className={`w-[90%] max-w-[420px] overflow-hidden rounded-xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.3)] ${accentClass}`}>
        <div className="flex items-center border-b border-gray-100 bg-gray-50 px-6 py-4">
          <span className="mr-3 text-2xl">{icon}</span>
          <h3 className="m-0 flex-grow text-lg font-semibold">{title}</h3>
          <button className="border-none bg-transparent text-[22px] text-gray-400 transition-colors hover:text-gray-700" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="px-6 py-5 text-center text-base leading-relaxed text-gray-800">
          <p>{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default BookingModal;
