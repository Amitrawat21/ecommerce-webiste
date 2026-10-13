
import { ArrowLeftOutlined, ArrowRightOutlined } from "@material-ui/icons";
import { useState } from "react";
import {sliderItems} from "../data";
import "../styles/slide.css";


const Slider = () => {
  const [slideIndex, setSlideIndex] = useState(0);

  const handleClick = (direction) => {
    if (direction === "left") {
      setSlideIndex(slideIndex > 0 ? slideIndex - 1 : 3);
    } else {
      setSlideIndex(slideIndex < 3 ? slideIndex + 1 : 0);
    }
  };

  return (
    <div className="slider-container">
      <div
        className="slider-arrow slider-arrow-left"
        onClick={() => handleClick("left")}
      >
        <ArrowLeftOutlined />
      </div>

      <div
        className="slider-wrapper"
        style={{ transform: `translateX(${slideIndex * -100}vw)` }}
      >
        {sliderItems.map((item) => (
          <div
            className="slider-slide"
            style={{ backgroundColor: `#${item.bg}` }}
            key={item.id}
          >
            <div className="slider-img-container">
              <img className="slider-image" src={item.img} alt={item.title} />
            </div>

            <div className="slider-info-container">
              <h1 className="slider-title">{item.title}</h1>
              <p className="slider-desc">{item.desc}</p>
              <button className="slider-button">SHOW NOW</button>
            </div>
          </div>
        ))}
      </div>

      <div
        className="slider-arrow slider-arrow-right"
        onClick={() => handleClick("right")}
      >
        <ArrowRightOutlined />
      </div>
    </div>
  );
};

export default Slider;
