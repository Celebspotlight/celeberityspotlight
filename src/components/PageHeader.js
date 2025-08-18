import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, breadcrumb }) => {
  return (
    <section className="page-header">
      <div className="container">
        {breadcrumb && (
          <nav className="breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <span>{breadcrumb}</span>
          </nav>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
    </section>
  );
};

export default PageHeader;