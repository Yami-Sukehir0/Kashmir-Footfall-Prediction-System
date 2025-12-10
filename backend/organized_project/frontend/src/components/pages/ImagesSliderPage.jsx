import React from "react";
import { ImagesSliderDemo } from "../ui/images-slider-demo";

const ImagesSliderPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Images Slider Demo
      </h1>
      <div className="max-w-6xl mx-auto">
        <ImagesSliderDemo />
      </div>
    </div>
  );
};

export default ImagesSliderPage;
