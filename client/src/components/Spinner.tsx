import React from 'react';

export const Spinner: React.FC<{text?: string}> = ({ text }) => (
  <div className="d-flex align-items-center gap-2 py-2">
    <div className="spinner-border spinner-border-sm" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <span>{text || 'Đang tải...'}</span>
  </div>
);
