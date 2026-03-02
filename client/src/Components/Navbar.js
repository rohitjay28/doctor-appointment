import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "../Styles/Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  const [nav, setNav] = useState(false);

  const openNav = () => {
    setNav(!nav);
  };

  return (
    <div className="navbar-section">
      <h1 className="navbar-title">
        <Link to="/">
          Doctor-Appointment <span className="navbar-sign">+</span>
        </Link>
      </h1>

      {/* Desktop */}
      <ul className="navbar-items">
        <li>
          <Link to="/" className="navbar-links">
            Home
          </Link>
        </li>
        <li>
          <span
            className="navbar-links"
            onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
            style={{ cursor: 'pointer' }}
          >
            Services
          </span>
        </li>
        <li>
          <span
            className="navbar-links"
            onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
            style={{ cursor: 'pointer' }}
          >
            About
          </span>
        </li>
        <li>
          <span
            className="navbar-links"
            onClick={() => document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' })}
            style={{ cursor: 'pointer' }}
          >
            Reviews
          </span>
        </li>
        <li>
          <span
            className="navbar-links"
            onClick={() => document.getElementById('doctors').scrollIntoView({ behavior: 'smooth' })}
            style={{ cursor: 'pointer' }}
          >
            Doctors
          </span>
        </li>
        <li>
          <Link to="/admin/login" className="navbar-links admin-link">
            🔐 Admin
          </Link>
        </li>
      </ul>

      {/* Mobile */}
      <div className={`mobile-navbar ${nav ? "open-nav" : ""}`}>
        <div onClick={openNav} className="mobile-navbar-close">
          <FontAwesomeIcon icon={faXmark} className="hamb-icon" />
        </div>

        <ul className="mobile-navbar-links">
          <li><Link onClick={openNav} to="/">Home</Link></li>
          <li><a onClick={openNav} href="#services">Services</a></li>
          <li><a onClick={openNav} href="#about">About</a></li>
          <li><a onClick={openNav} href="#reviews">Reviews</a></li>
          <li><a onClick={openNav} href="#doctors">Doctors</a></li>
          <li><a onClick={openNav} href="#contact">Contact</a></li>
          <li>
            <Link onClick={openNav} to="/admin/login">
              🔐 Admin
            </Link>
          </li>
        </ul>
      </div>

      {/* Hamburger Icon */}
      <div className="mobile-nav">
        <FontAwesomeIcon
          icon={faBars}
          onClick={openNav}
          className="hamb-icon"
        />
      </div>
    </div>
  );
}

export default Navbar;