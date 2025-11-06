// src/Carousel.jsx

import React, { useState } from 'react';

function Carousel() {
  const slides = [
    { id: 1, text: "사지말고 입양하세요 🧡", color: "bg-orange-500" },
    { id: 2, text: "오늘의 추천 동물들을 만나보세요!", color: "bg-blue-500" },
    { id: 3, text: "따뜻한 가족이 되어주세요 😊", color: "bg-green-500" },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
      
      {/* 슬라이드 이미지 영역 */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center text-white text-2xl font-bold ${slide.color}`}
          style={{ opacity: index === currentSlide ? 1 : 0 }}
        >
          {slide.text}
        </div>
      ))}

      {/* 이전/다음 버튼 */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 z-10"
      >
        &#10094; {/* 왼쪽 화살표 */}
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 z-10"
      >
        &#10095; {/* 오른쪽 화살표 */}
      </button>

      {/* 페이지 표시 점 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;