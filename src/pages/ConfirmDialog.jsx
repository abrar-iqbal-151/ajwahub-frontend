function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>
        <h4 className="confirm-title">Remove Item</h4>
        <p className="confirm-msg">{message}</p>
        <div className="confirm-btns">
          <button className="confirm-yes" onClick={onConfirm}>Yes, Remove</button>
          <button className="confirm-no" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
