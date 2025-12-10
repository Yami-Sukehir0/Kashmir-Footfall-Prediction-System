import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { ImagesSlider } from "../ui/images-slider";
import "../Hero.css";

const PublicLayout = () => {
  // Use local Kashmir tourism images
  const images = [
    "/images/GULMARG.png",
    "/images/PAHALGAM.png",
    "/images/SONAMARG.png",
    "/images/YOUSMARG.png",
    "/images/DOODPATHRI.png",
    "/images/AHARBAL.png",
    "/images/KOKERNAG.png",
    "/images/LOLAB.png",
    "/images/MANASBAL.png",
    "/images/GUREZ.png",
  ];

  return (
    <div className="public-layout">
      <ImagesSlider
        className="background-slider"
        images={images}
        overlay={true}
        overlayClassName="background-slider-overlay"
      />
      <div className="content-wrapper">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default PublicLayout;
