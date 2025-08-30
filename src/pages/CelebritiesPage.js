import React from 'react';
import Celebrities from '../components/Celebrities';
import './CelebritiesPage.css';

function CelebritiesPage() {
  return (
    <div className="celebrities-page">
      <div className="page-header">
        <div className="container">
          <h1>Our Celebrity Roster</h1>
          <p>Choose from our exclusive selection of celebrities for your perfect celebrity experience</p>
        </div>
      </div>
      <Celebrities />
    </div>
  );
}

export default CelebritiesPage;