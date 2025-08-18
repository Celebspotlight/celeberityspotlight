import React from 'react';
import Celebrities from '../components/Celebrities';
import './CelebritiesPage.css';

function CelebritiesPage() {
  return (
    <div className="celebrities-page">
      <div className="page-header">
        <h1>Our Celebrity Roster</h1>
        <p>Choose from our exclusive selection of celebrities for your perfect celebrity experience</p>
      </div>
      <Celebrities />
    </div>
  );
}

export default CelebritiesPage;