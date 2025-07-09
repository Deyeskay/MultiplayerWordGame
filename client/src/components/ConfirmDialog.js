import React from 'react';

export default function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: 30, borderRadius: 8 }}>
        <p>Are you sure?</p>
        <button onClick={onConfirm} style={{ marginRight: 10 }}>Yes</button>
        <button onClick={onCancel}>No</button>
      </div>
    </div>
  );
}
