import React, { useEffect, useState, useCallback } from 'react';
import { ChevronRight, Bell, Heart, Bot } from 'lucide-react';

// --- CSS Block for Styling ---
// Tailwind CSS 클래스를 일반 CSS로 변환하여 여기에 정의합니다.
const styles = `
.home-container {
  min-height: 100vh;
  background-color: #F2EDE4; /* C1: Light Background */
  font-family: 'Inter', sans-serif;
}

.main-content {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding: 1.5rem 1rem;
}

.main-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1.5rem;
}

.main-section, .sidebar-section {
  grid-column: span 12 / span 12;
}

@media (min-width: 1024px) { /* lg: breakpoint */
  .main-section {
    grid-column: span 9 / span 9;
  }
  .sidebar-section {
    grid-column: span 3 / span 3;
  }
}

.section-spacing {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Carousel Styles */
.carousel-wrapper {
  height: 20rem; 
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}

.slide-item {
  top: 0; right: 0; bottom: 0; left: 0;
  transition: opacity 700ms;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white; /* 텍스트는 밝게 유지 */
  font-size: 1.5rem; /* 폰트 크기 조정 */
  line-height: 2.25rem;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}
.slide-color-1 { background: linear-gradient(to right, #F2CBBD, #735048); } /* C4 to C5 */
.slide-color-2 { background: linear-gradient(to right, #735048, #594C3C); } /* C5 to C2 */
.slide-color-3 { background: linear-gradient(to right, #F2CBBD, #594C3C); } /* C4 to C2 */

.carousel-dots {
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
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  transition: all 150ms;
  background-color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}
.dot-active {
  background-color: white;
  width: 1.5rem;
}

/* Animal Card Styles (추천 동물에 사용) */
.card-wrapper {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); /* shadow-sm */
  transition: box-shadow 150ms;
  cursor: pointer;
}
.card-wrapper:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06); /* hover:shadow-md */
}
.card-image-box {
  aspect-ratio: 1 / 1;
  background-color: #f3f4f6; /* gray-100, unchanged for placeholder */
  overflow: hidden;
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms;
}
.card-wrapper:hover .card-image {
  transform: scale(1.05); /* hover:scale-105 */
}
.card-info {
  padding: 0.75rem;
}
.card-title {
  font-weight: 600;
  font-size: 0.875rem; /* text-sm */
  margin-bottom: 0.25rem;
  color: #594C3C; /* C2 */
}
.card-meta {
  font-size: 0.75rem; /* text-xs */
  color: #735048; /* C5: Secondary Text Color */
}

/* Quick Menu Styles (unchanged) */
.menu-box {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  padding: 1.5rem;
}
.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
@media (min-width: 640px) { /* sm: breakpoint */
  .menu-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: background-color 150ms;
  text-decoration: none;
  color: inherit;
}
.menu-item:hover {
  background-color: #F2E2CE; /* C3: Light Beige Hover */
}
.menu-icon-box {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  background-color: #F2E2CE; /* C3: Icon Background */
}
.menu-text {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Notice Styles (color updated) */
.notice-wrapper {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  padding: 1rem;
}
/* Sticky style for sidebar notice */
.sticky-notice {
    position: sticky;
    top: 5rem;
}
.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.notice-title {
  font-weight: 700;
  color: #594C3C; /* C2: Dark Brown Title */
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.notice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 150ms;
}
.notice-item:hover {
  background-color: #F2E2CE; /* C3: Light Beige Hover */
}
.notice-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0; /* Ensures truncation works */
}
.notice-new-tag {
  font-size: 0.75rem;
  background-color: #F2CBBD; /* C4: Warm Pink Accent */
  color: #594C3C; /* C2: Dark Text on Tag */
  padding: 0 0.375rem;
  border-radius: 0.25rem;
}
.notice-text {
  font-size: 0.875rem;
  color: #594C3C; /* C2: Dark Brown Text */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notice-date {
  font-size: 0.75rem;
  color: #735048; /* C5: Secondary date color */
}

/* Question/Latest Post Board Styles */
.question-list-container {
    display: flex;
    flex-direction: column;
}
.question-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #F2E2CE; /* C3 */
    cursor: pointer;
    transition: background-color 150ms;
}
.question-item:last-child {
    border-bottom: none;
}
.question-item:hover {
    background-color: #F2E2CE; /* C3: Light Beige Hover */
}
.question-title {
    flex: 1;
    font-size: 0.875rem;
    color: #594C3C; /* C2 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 1rem;
    font-weight: 500;
}
.question-meta {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    color: #735048; /* C5 */
    gap: 0.75rem;
}
.question-user {
    /* Simple username display */
}
.question-comments {
    white-space: nowrap;
}

/* General Styles (color updated) */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.section-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 700;
  color: #594C3C; /* C2: Dark Brown Title */
}
.section-link {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #735048; /* C5: Accent Link Color */
  text-decoration: none;
  transition: color 150ms;
}
.section-link:hover {
  color: #594C3C; /* C2: Darker Hover Link */
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.grid-cols-5 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 640px) { /* sm: breakpoint */
  .grid-cols-5 {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

/* Custom Color Classes for Icons/Accents */
.text-icon-color { color: #594C3C; /* C2 */ }

/* Banner Ad (color updated) */
.ad-banner {
    background: linear-gradient(to bottom right, #F2EDE4, #F2E2CE); /* C1 to C3 */
    border-radius: 0.5rem;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
}
.ad-text-1 { color: #735048; /* C5 */ font-size: 0.875rem; margin-bottom: 0.5rem; }
.ad-text-2 { color: #735048; /* C5 */ font-size: 0.75rem; }

/* AI Consultant Styles */
.ai-consultant-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  padding: 1rem;
  margin-bottom: 1.5rem; /* Separator for ad banner */
}
.ai-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #F2E2CE; /* C3 */
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  color: #594C3C;
  resize: none;
}
.ai-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #735048; /* C5 */
  color: white;
  font-weight: 600;
  border-radius: 0.375rem;
  transition: background-color 150ms;
  cursor: pointer;
}
.ai-button:hover:not(:disabled) {
  background-color: #594C3C; /* C2 */
}
.ai-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.ai-response-box {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #F2EDE4; /* C1 */
  border: 1px dashed #F2CBBD; /* C4 */
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #594C3C;
  white-space: pre-wrap;
  min-height: 80px;
}
.ai-response-loading {
  text-align: center;
  padding: 1rem;
  color: #735048;
}
.ai-citation {
  margin-top: 0.5rem;
  font-size: 0.65rem;
  color: #735048;
}
.ai-citation a {
  color: #735048;
  text-decoration: underline;
}
`;
// --- End CSS Block ---


// API 키 (비워둠)
const apiKey = ""; 

/**
 * Gemini API 호출 함수 (Google Search Grounding 포함)
 * @param {string} prompt 사용자 질문
 * @returns {Promise<{text: string, sources: Array<{uri: string, title: string}>}>}
 */
const callGeminiApi = async (prompt) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const systemPrompt = "당신은 반려동물 전문가입니다. 사용자의 질문에 대해 명확하고 도움이 되는 답변을 제공하며, 항상 사용자 친화적이고 공감하는 태도를 유지해야 합니다. 전문적인 조언이 필요한 경우, 수의사와 상담하도록 안내하세요. 답변은 한국어로 제공합니다.";
    
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    let response = null;
    let attempt = 0;
    const maxRetries = 5;

    while (attempt < maxRetries) {
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                const candidate = result.candidates?.[0];

                if (candidate && candidate.content?.parts?.[0]?.text) {
                    const text = candidate.content.parts[0].text;
                    let sources = [];
                    const groundingMetadata = candidate.groundingMetadata;

                    if (groundingMetadata && groundingMetadata.groundingAttributions) {
                        sources = groundingMetadata.groundingAttributions
                            .map(attribution => ({
                                uri: attribution.web?.uri,
                                title: attribution.web?.title,
                            }))
                            .filter(source => source.uri && source.title);
                    }
                    return { text, sources };
                } else {
                    return { text: "죄송합니다. 답변을 생성하는 데 실패했습니다.", sources: [] };
                }
            } else {
                if (response.status === 429 && attempt < maxRetries - 1) {
                    // 429 Too Many Requests (Rate Limit) -> Apply exponential backoff
                    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    attempt++;
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw new Error(`API error: ${response.statusText}`);
                }
            }
        } catch (error) {
            console.error("Gemini API call failed after retries:", error);
            return { text: "API 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", sources: [] };
        }
    }
    return { text: "최대 재시도 횟수를 초과했습니다. 다시 시도해 주세요.", sources: [] };
};


// 캐러셀 컴포넌트 (unchanged logic)
function Carousel() {
  const slides = [
    { id: 1, text: "사지말고 입양하세요 🧡", colorClass: "slide-color-1" },
    { id: 2, text: "오늘의 추천 동물들을 만나보세요!", colorClass: "slide-color-2" },
    { id: 3, text: "따뜻한 가족이 되어주세요 😊", colorClass: "slide-color-3" },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`slide-item ${slide.colorClass}`}
          style={{ opacity: index === currentSlide ? 1 : 0 }}
        >
          {slide.text}
        </div>
      ))}
      <div className="carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`dot-button ${
              index === currentSlide ? 'dot-active' : ''
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// 동물 카드 컴포넌트 (추천 동물에 사용)
const AnimalCard = ({ name, imageSrc, age, gender }) => (
  <div className="card-wrapper">
    <div className="card-image-box">
      <img src={imageSrc} alt={name} className="card-image"/>
    </div>
    <div className="card-info">
      <h3 className="card-title">{name}</h3>
      <p className="card-meta">{age} · {gender}</p>
    </div>
  </div>
);

// 공지사항 아이템
const NoticeItem = ({ title, date, isNew }) => (
  <div className="notice-item">
    <div className="notice-left">
      {isNew && <span className="notice-new-tag">N</span>}
      <span className="notice-text">{title}</span>
    </div>
    <span className="notice-date">{date}</span>
  </div>
);

// 질문 게시판/최신글 아이템
const QuestionItem = ({ title, user, comments }) => (
  <div className="question-item">
    <span className="question-title">{title}</span>
    <div className="question-meta">
      <span className="question-user">{user}</span>
      <span className="question-comments">💬 {comments}</span>
    </div>
  </div>
);

// 컴포넌트가 임시로 사용할 Link 함수 (실제 라우팅 없이 단순 console.log)
const MockLink = ({ to, className, children }) => (
    <a href="#" className={className} onClick={() => console.log(`Navigating to: ${to}`)}>{children}</a>
);

// AI 건강 조언가 컴포넌트
function AiConsultant() {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        setResponse(null);

        const result = await callGeminiApi(question.trim());

        setResponse(result);
        setLoading(false);
    }, [question]);

    return (
        <div className="ai-consultant-card">
            <h3 className="notice-title mb-3">
                <Bot className="w-4 h-4" />
                AI 반려동물 조언가
            </h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="ai-input"
                    placeholder="반려동물의 건강이나 행동에 대해 무엇이든 물어보세요."
                    rows="3"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <button
                    type="submit"
                    className="ai-button"
                    disabled={loading || !question.trim()}
                >
                    {loading ? '답변 생성 중...' : '조언 요청'}
                </button>
            </form>

            <div className="ai-response-box">
                {loading ? (
                    <div className="ai-response-loading">AI가 답변을 준비하고 있습니다...</div>
                ) : response ? (
                    <>
                        <p>{response.text}</p>
                        {response.sources && response.sources.length > 0 && (
                            <div className="ai-citation">
                                <p>출처:</p>
                                {response.sources.map((source, index) => (
                                    <p key={index}><a href={source.uri} target="_blank" rel="noopener noreferrer">{source.title}</a></p>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p>궁금한 점을 입력하고 '조언 요청' 버튼을 눌러보세요.</p>
                )}
            </div>
        </div>
    );
}

// --- Mock Data for Sections ---
const mockNotices = [
  { title: "필독! 새로운 입양 절차 안내입니다", date: "11.13", isNew: true },
  { title: "겨울철 반려동물 건강 관리 팁 공유", date: "11.12", isNew: true },
  { title: "입양 후기 이벤트 당첨자 발표", date: "11.10", isNew: false },
  { title: "정기 점검 안내 (11/08 02:00~04:00)", date: "11.08", isNew: false },
  { title: "커뮤니티 이용 규칙 변경 안내", date: "11.05", isNew: false },
  { title: "새로운 펫 용품 등록 안내", date: "11.01", isNew: false },
];

const mockLatestPosts = [
  { title: "새로운 가족을 맞이할 때 준비해야 할 5가지", user: "행복한집사", comments: 15 },
  { title: "강아지 훈련, 칭찬이 중요해요! 긍정 강화 훈련법", user: "훈련사K", comments: 8 },
  { title: "고양이가 사료를 갑자기 안 먹는데 왜 그럴까요?", user: "멍냥맘", comments: 12 },
  { title: "털 빠짐 관리 팁 좀 공유해주세요!", user: "털뿜뿜", comments: 20 },
  { title: "반려동물과 함께 하는 안전한 여행 팁", user: "여행가J", comments: 7 },
];

const mockRecommendedAnimals = [
    { name: "복돌이", imageSrc: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop", age: "2살", gender: "남아" },
    { name: "둥가", imageSrc: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit-crop", age: "1살", gender: "여아" },
    { name: "보리", imageSrc: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=400&fit-crop", age: "3살", gender: "남아" },
    { name: "초코", imageSrc: "https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=400&h=400&fit-crop", age: "2살", gender: "여아" },
];


export default function Home({ isLoggedIn }) {
  // Mocking Link component with MockLink for standalone usage
  const Link = MockLink;
  
  return (
    <>
      <style>{styles}</style>
      <div className="home-container">
        <main className="main-content">
          <div className="main-grid">
            
            {/* 메인 콘텐츠 영역 */}
            <div className="main-section section-spacing">
              
              {/* 캐러셀 */}
              <div className="carousel-wrapper">
                <Carousel />
              </div>

              {/* 빠른 메뉴 */}
              <div className="menu-box">
                <div className="menu-grid">
                  <Link to="/adoption" className="menu-item">
                    <div className="menu-icon-box">
                      <Heart className="w-6 h-6 text-icon-color" />
                    </div>
                    <span className="menu-text">입양하기</span>
                  </Link>
                  <Link to="/board" className="menu-item">
                    <div className="menu-icon-box">
                      <Bell className="w-6 h-6 text-icon-color" />
                    </div>
                    <span className="menu-text">커뮤니티</span>
                  </Link>
                  <Link to="/reviews" className="menu-item">
                    <div className="menu-icon-box">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <span className="menu-text">용품 리뷰</span>
                  </Link>
                  <Link to="/diary" className="menu-item">
                    <div className="menu-icon-box">
                      <span className="text-2xl">📔</span>
                    </div>
                    <span className="menu-text">반려일기</span>
                  </Link>
                </div>
              </div>

              {/* 질문 게시판 */}
              <div className="menu-box">
                <div className="section-header">
                  <h2 className="section-title">📝 질문 게시판</h2>
                  <Link to="/board?category=질문답변" className="section-link">
                    더보기 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="question-list-container">
                    <QuestionItem title="새끼 강아지 예방접종 시기 문의드립니다" user="행복한집사" comments={5} />
                    <QuestionItem title="고양이가 사료를 갑자기 안 먹는데 왜 그럴까요?" user="멍냥맘" comments={12} />
                    <QuestionItem title="산책 시 강아지가 다른 강아지에게 짖는 문제" user="복돌이아빠" comments={8} />
                    <QuestionItem title="털 빠짐 관리 팁 좀 공유해주세요!" user="털뿜뿜" comments={20} />
                </div>
              </div>

              {/* 최신글 */}
              <div className="menu-box">
                <div className="section-header">
                  <h2 className="section-title">✨ 최신글</h2>
                  <Link to="/board" className="section-link">
                    더보기 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="question-list-container">
                    {mockLatestPosts.map((post, index) => (
                        <QuestionItem 
                            key={index} 
                            title={post.title} 
                            user={post.user} 
                            comments={post.comments} 
                        />
                    ))}
                </div>
              </div>

              {/* 오늘의 추천 반려동물 */}
              <div className="menu-box">
                <div className="section-header">
                  <h2 className="section-title">🐾 오늘의 추천 반려동물</h2>
                  <Link to="/adoption" className="section-link">
                    더보기 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="main-grid grid-cols-4">
                  {mockRecommendedAnimals.map((animal, index) => (
                      <AnimalCard
                          key={index}
                          name={animal.name}
                          imageSrc={animal.imageSrc}
                          age={animal.age}
                          gender={animal.gender}
                      />
                  ))}
                </div>
              </div>
              
            </div>

            {/* 사이드바 */}
            <aside className="sidebar-section section-spacing">
              
              {/* AI 건강 조언가 */}
              <AiConsultant />

              {/* 공지사항 (사이드바 버전) */}
              <div className="notice-wrapper sticky-notice">
                <div className="notice-header">
                  <h3 className="notice-title">
                    <Bell className="w-4 h-4" />
                    공지사항
                  </h3>
                  <button className="text-xs text-gray-500 hover:text-gray-700">전체</button>
                </div>
                <div className="notice-list">
                  {mockNotices.slice(0, 5).map((notice, index) => (
                        <NoticeItem 
                            key={index} 
                            title={notice.title} 
                            date={notice.date} 
                            isNew={notice.isNew} 
                        />
                    ))}
                </div>
              </div>

              {/* 광고 배너 */}
              <div className="ad-banner">
                <p className="ad-text-1">🎁 배너 광고</p>
                <p className="ad-text-2">300x250</p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}