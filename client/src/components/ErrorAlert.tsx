import React from 'react';

export const ErrorAlert: React.FC<{error?: string}> = ({ error }) => {
  if(!error) return null;
  return <div className="alert alert-danger py-1 my-2">{error}</div>;
};
