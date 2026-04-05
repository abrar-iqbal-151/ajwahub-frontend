function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">🗑️</div>
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
