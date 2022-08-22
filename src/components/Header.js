import React from 'react'
import logo from "../assets/logo.png";
import "./Header.css";

function Header() {
  return (
    <div className="header">
      <div>
        <img src={logo} alt="logo" />
      </div>
      <div>
        <button>Sign In</button>
      </div>
    </div>
  )
}

export default Header