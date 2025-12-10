# Images Slider Component

This component creates a beautiful image slider with smooth animations using Framer Motion. It's designed to work without conflicting with existing CSS frameworks.

## Installation

Make sure you have the required dependencies installed:

```bash
npm install framer-motion
```

## Usage

1. Copy the `images-slider.jsx` and `images-slider.css` files to your components directory
2. Import the component in your page:

```jsx
import { ImagesSlider } from "./components/ui/images-slider";

const MyComponent = () => {
  const images = [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg",
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
          Your Content Here
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
          <span>Call to Action</span>
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
```

There's also a demo component (`demo.jsx`) that shows a complete implementation.

## Props

| Prop             | Type           | Default   | Description                                   |
| ---------------- | -------------- | --------- | --------------------------------------------- |
| images           | string[]       | required  | Array of image URLs to display in the slider  |
| children         | ReactNode      | required  | Content to display over the slider            |
| overlay          | boolean        | true      | Whether to show the dark overlay              |
| overlayClassName | string         | undefined | Additional classes for the overlay            |
| className        | string         | undefined | Additional classes for the container          |
| autoplay         | boolean        | true      | Whether to automatically cycle through images |
| direction        | "up" \| "down" | "up"      | Direction of the exit animation               |

## Features

- Smooth animations with Framer Motion
- Keyboard navigation (arrow keys)
- Autoplay functionality
- Responsive design
- Customizable overlay
- Works with existing CSS without conflicts
- Self-contained styling with included CSS file
