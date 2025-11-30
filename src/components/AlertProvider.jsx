import { useState, useEffect } from 'react';
import Popup from './Popup';

export default function AlertProvider({ children }) {
  const [popup, setPopup] = useState({ open: false, title: '', message: '' });

  function show(message, title = '') {
    setPopup({ open: true, title: title || '', message: String(message) });
  }

  function close() {
    setPopup({ open: false, title: '', message: '' });
  }

  useEffect(() => {
    const prev = window.alert;
    window.alert = (msg) => show(msg, 'Atención');
    // expose a global helper in case other modules want to call with title
    window.showPopup = (msg, title) => show(msg, title);
    return () => { window.alert = prev; delete window.showPopup; };
  }, []);

  return (
    <>
      {children}
      <Popup open={popup.open} title={popup.title} onClose={close}>
        <div style={{ whiteSpace: 'pre-wrap' }}>{popup.message}</div>
      </Popup>
    </>
  );
}