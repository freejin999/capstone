import React, { useState, useEffect } from 'react';
// useEffect를 사용하여 자동 슬라이드 기능을 추가했습니다.

// --- CSS Block for Styling ---
const styles = `
.carousel-container {
  position: relative;
  width: 100%;
  height: 100%; /* 부모 요소의 높이를 따름 */
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.slide-item {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: opacity 700ms ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem; 
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
}

/* Color Palette Application */
.slide-color-1 { background: linear-gradient(to right, #F2CBBD, #735048); } /* C4 to C5 */
.slide-color-2 { background: linear-gradient(to right, #735048, #594C3C); } /* C5 to C2 */
.slide-color-3 { background: linear-gradient(to right, #F2CBBD, #594C3C); } /* C4 to C2 */


/* Navigation Buttons */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(89, 76, 60, 0.3); /* C2 Dark Brown with transparency */
  color: white;
  padding: 0.75rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 150ms;
  z-index: 10;
  border: none;
}
.nav-button:hover {
  background-color: rgba(89, 76, 60, 0.6);
}
.nav-left { left: 1rem; }
.nav-right { right: 1rem; }

/* Dots Indicator */
.dots-container {
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  z-index: 10;
}
.dot-button {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  transition: background-color 150ms;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border: none;
}
.dot-active {
  background-color: white;
  width: 1.5rem;
  border-radius: 0.5rem; /* 활성 점은 길게 표시 */
}
`;
// --- End CSS Block ---


function Carousel() {
  const slides = [
    { id: 1, text: "사지말고 입양하세요 🧡", colorClass: "slide-color-1" },
    { id: 2, text: "오늘의 추천 동물들을 만나보세요!", colorClass: "slide-color-2" },
    { id: 3, text: "따뜻한 가족이 되어주세요 😊", colorClass: "slide-color-3" },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // 자동 슬라이드 기능 추가
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]); // nextSlide가 바뀌지 않으므로 deps에 넣어도 무방 (React 18 linting style)


  return (
    <>
      <style>{styles}</style>
      <div className="carousel-container">
        
        {/* 슬라이드 이미지 영역 */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide-item ${slide.colorClass}`}
            style={{ opacity: index === currentSlide ? 1 : 0 }}
          >
            {slide.text}
          </div>
        ))}

        {/* 이전/다음 버튼 */}
        <button
          onClick={prevSlide}
          className="nav-button nav-left"
          aria-label="Previous slide"
        >
          &#10094; {/* 왼쪽 화살표 */}
        </button>
        <button
          onClick={nextSlide}
          className="nav-button nav-right"
          aria-label="Next slide"
        >
          &#10095; {/* 오른쪽 화살표 */}
        </button>

        {/* 페이지 표시 점 */}
        <div className="dots-container">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`dot-button ${index === currentSlide ? 'dot-active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Carousel;