import React from 'react';

const AppPageHeader = ({ title, subtitle, actions, className = '' }) => (
  <div
    className={`mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between app-enter ${className}`}
  >
    <div>
      <h1 className="app-page-title">{title}</h1>
      {subtitle && <p className="app-page-subtitle mt-0.5">{subtitle}</p>}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

export default AppPageHeader;
