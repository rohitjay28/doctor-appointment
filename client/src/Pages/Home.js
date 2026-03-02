import React from "react";
import Navbar from "../Components/Navbar";
import Hero from "../Components/Hero";
import Info from "../Components/Info";
import About from "../Components/About";
import BookAppointment from "../Components/BookAppointment";
import Reviews from "../Components/Reviews";
import Doctors from "../Components/Doctors";
import Footer from "../Components/Footer";
import Stats from "../Components/Stats";

function Home() {
  return (
    <div className="home-section">
      <Navbar />
      <div id="home">
        <Hero />
        <Info />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="services">
        <BookAppointment />
        <Stats />
      </div>
      <div id="reviews">
        <Reviews />
      </div>
      <div id="doctors">
        <Doctors />
      </div>
      <Footer />
    </div>
  );
}

export default Home;