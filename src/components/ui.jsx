import { useEffect, useState } from 'react';
import { toneFor } from '../lib/format';
import { useStore } from '../context/Store';

export function DressImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return (
      <div className={`ph ${className || ''}`} role="img" aria-label={alt}>
        <span>{alt}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export function Pill({ status, children }) {
  return <span className={`pill ${toneFor(status)}`}>{children}</span>;
}

export function Toaster() {
  const { toasts } = useStore();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((item) => (
        <div className="toast" key={item.id}>
          {item.message}
        </div>
      ))}
    </div>
  );
}

export function Empty({ title, text, action }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
