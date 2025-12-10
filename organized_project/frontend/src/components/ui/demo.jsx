import React from "react";
import { ImagesSlider } from "./images-slider";

export const ImagesSliderDemo = () => {
  const images = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  return (
    <ImagesSlider className="h-[40rem]" images={images}>
      <div className="images-slider-content">
        <h2
          style={{
            fontSize: "2.25rem",
            fontWeight: "bold",
            textAlign: "center",
            background: "linear-gradient(to bottom, #ffffff, #cccccc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            padding: "1rem",
          }}
        >
          Kashmir Tourism
          <br />
          Experience Paradise on Earth
        </h2>
        <button
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(110, 231, 183, 0.2)",
            borderColor: "rgba(110, 231, 183, 0.3)",
            borderWidth: "1px",
            borderStyle: "solid",
            color: "white",
            borderRadius: "9999px",
            marginTop: "1rem",
            position: "relative",
          }}
        >
          <span>Explore Now →</span>
          <div
            style={{
              position: "absolute",
              left: "12.5%",
              right: "12.5%",
              height: "1px",
              bottom: "-1px",
              background:
                "linear-gradient(to right, transparent, #10b981, transparent)",
            }}
          />
        </button>
      </div>
    </ImagesSlider>
  );
};
