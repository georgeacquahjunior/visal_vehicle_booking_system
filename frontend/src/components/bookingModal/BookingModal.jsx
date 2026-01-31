import "./BookingModal.css";

const BookingModal = ({ message, onClose, type = "error" }) => {
  if (!message) return null;

  const title = type === "error" ? "Error" : "Success";
  const icon = type === "error" ? <i style={{color: "red"}} class="fa-solid fa-ban"></i> : <i style={{color: "green"}} className="fa-regular fa-circle-check"></i>;

  return (
    <div className="modal-overlay">
      <div className={`modal-container ${type}`}>
        <div className="modal-header">
          <span className="modal-icon">{icon}</span>
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
