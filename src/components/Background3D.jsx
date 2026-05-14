import React from 'react';

export default function Background3D() {
  return (
    <div className="global-bg-3d">
      <div className="desc-bg-grid" />
      <div className="desc-orb desc-orb1" />
      <div className="desc-orb desc-orb2" />
      <div className="desc-orb desc-orb3" />
      <div className="desc-orb desc-orb4" />
      <div className="desc-bg-lines">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="desc-bg-line" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>
    </div>
  );
}
