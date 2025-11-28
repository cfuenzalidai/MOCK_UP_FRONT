import '../assets/styles/Popup.css';

export default function Popup({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true">
      <div className="popup-card">
        <div className="popup-header">
          <div className="popup-title">{title}</div>
          <button className="popup-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="popup-body">{children}</div>
      </div>
    </div>
  );
}
