import React from "react";
import DoctorCard from "./DoctorCard";
import profile1 from "../Assets/Dr.-Dilip-M-Babu.png";
import profile2 from "../Assets/Dr.-C.-Raghu.png";
import profile3 from "../Assets/Dr-Bhagya-Lakshmi-S.png";
import profile4 from "../Assets/Dr.-Nagendra-Mahendra.png";
import "../Styles/Doctors.css";

function Doctors() {
  return (
    <div className="doctor-section" id="doctors">
      <div className="dt-title-content">
        <h3 className="dt-title">
          <span>Meet Our Doctors</span>
        </h3>

        <p className="dt-description">
          Meet our exceptional team of specialist doctors, dedicated to
          providing top-notch healthcare services at Health Plus. Trust in their
          knowledge and experience to lead you towards a healthier and happier
          life.
        </p>
      </div>

      <div className="dt-cards-content">
        <DoctorCard
          img={profile1}
          name="Dr. Dilip M Babu"
          title="Sr. Consultant Nephrologist Yashoda hospital"
          stars="4.9"
          reviews="1800"
        />
        <DoctorCard
          img={profile2}
          name="Dr. C. Raghu"
          title="Cardiology Yashoda hospital"
          stars="4.8"
          reviews="700"
        />
        <DoctorCard
          img={profile3}
          name="Dr. Bagyalakshmi A.D.S"
          title="Gynaecology & Obstetrics Yashoda hospital"
          stars="4.7"
          reviews="450"
        />
        <DoctorCard
          img={profile4}
          name="Dr. Nagendra Mahendra"
          title=" Consultant ENT Yashoda hospital"
          stars="4.8"
          reviews="500"
        />
      </div>
    </div>
  );
}

export default Doctors;
