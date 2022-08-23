import React from 'react'
import logo from "../assets/logo.png";
import "./Header.css";

function Header() {
  return (
    <div className="header">
      <div>
        <img src={logo} alt="logo" />
      </div>
      <div className="header-info">
        <div className="flex items-center space-between">
          <p>System status :</p>
          <p style={{ backgroundColor: "#2CB816" }}></p>
        </div>
        <button>Sign In</button>
      </div>
    </div>
  )
}

export default Header