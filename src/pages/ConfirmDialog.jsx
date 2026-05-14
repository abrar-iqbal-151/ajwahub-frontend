function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      {/* 3D Background */}
      <div className="desc-bg-3d">
        <div className="desc-bg-grid" />
        <div className="desc-orb desc-orb1" />
        <div className="desc-orb desc-orb2" />
        <div className="desc-orb desc-orb3" />
        <div className="desc-orb desc-orb4" />
        <div className="desc-bg-lines">
          {[...Array(6)].map((_,i) => <div key={i} className="desc-bg-line" style={{animationDelay: `${i*0.4}s`}} />)}
        </div>
      </div>
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


