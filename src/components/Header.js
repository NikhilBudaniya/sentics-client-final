import React from 'react'
import { useSelector } from 'react-redux';
import logo from "../assets/logo.png";
import "./Header.css";

function Header() {
  const systemStatus = useSelector((state) => state.systemStatus.active);

  return (
    <div className="header">
      <div>
        <img src={logo} alt="logo" />
      </div>
      <div className="header-info">
        <div className="flex items-center space-between">
          <p>System status :</p>
          <p style={{ backgroundColor: systemStatus ? "#2CB816" : "#FF0000" }}></p>
        </div>
        <button>Sign In</button>
      </div>
    </div>
  )
}

export default Header