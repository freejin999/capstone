import React, { useEffect, useState, useCallback } from 'react';
// 🌟 [수정] react-router-dom에서 실제 Link를 임포트합니다.
import { Link } from 'react-router-dom';
// 🌟 [수정] BookOpen 아이콘 추가
import { ChevronRight, Bell, Heart, Bot, Star, MessageSquare, BookOpen } from 'lucide-react'; 

// --- CSS Block for Styling ---
// (이전과 동일한 몽글몽글 디자인 CSS)
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
  position: relative; /* 🌟 Dot를 위해 relative 추가 */
}
.slide-item {
  position: absolute; /* 🌟 [수정] position: absolute 추가 */
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
  border: none; /* 🌟 [추가] 버튼 기본 테두리 제거 */
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
  text-decoration: none; /* 🌟 [추가] Link 태그 밑줄 제거 */
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
  color: #594C3C; /* 🌟 [추가] 텍스트 색상 */
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
  text-decoration: none; 
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
  font-weight: 600; 
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
    text-decoration: none; 
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
    white-space: nowrap; 
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
  gap: 1rem; 
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
  font-family: inherit; 
}
.ai-input:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 2px var(--brand-primary-light);
    outline: none;
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
  border: none; 
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
  line-height: 1.6; 
}
.ai-response-loading {
  text-align: center;
  padding: 1rem;
  color: #735048;
}
.ai-citation {
  margin-top: 0.5rem;
  font-size: 0.75rem; 
  color: #735048;
}
.ai-citation a {
  color: #735048;
  text-decoration: underline;
}
.ai-citation p {
    margin-bottom: 0.25rem; 
}
`;
// --- End CSS Block ---


// API 키 (비워둠)
const apiKey = ""; 

/**
 * Gemini API 호출 함수 (Google Search Grounding 포함)
 * (이 함수는 수정되지 않았습니다 - 기존 로직 100% 동일)
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


// 캐러셀 컴포넌트 (수정 없음)
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
// 🌟 [수정] age prop은 "2살" 같이 '살'이 포함된 string으로 받으므로, 템플릿에서 '살'을 제거합니다.
const AnimalCard = ({ id, name, imageSrc, age, gender }) => (
  <Link to={`/adoption/${id}`} className="card-wrapper">
    <div className="card-image-box">
      <img src={imageSrc} alt={name} className="card-image"/>
    </div>
    <div className="card-info">
      <h3 className="card-title">{name}</h3>
      {/* 🌟 [수정] {age}살 -> {age} 로 변경 */}
      <p className="card-meta">{age} · {gender}</p>
    </div>
  </Link>
);

// 공지사항 아이템
// 🌟 [수정] Link 태그로 감싸서 실제 상세 페이지로 이동
const NoticeItem = ({ id, title, date, isNew }) => (
  <Link to={`/board/${id}`} className="notice-item">
    <div className="notice-left">
      {isNew && <span className="notice-new-tag">N</span>}
      <span className="notice-text">{title}</span>
    </div>
    <span className="notice-date">{date}</span>
  </Link>
);

// 질문 게시판/최신글 아이템
// 🌟 [수정] Link 태그로 감싸서 실제 상세 페이지로 이동
const QuestionItem = ({ id, title, user, comments }) => (
  <Link to={`/board/${id}`} className="question-item">
    <span className="question-title">{title}</span>
    <div className="question-meta">
      <span className="question-user">{user}</span>
      <span className="question-comments">💬 {comments}</span>
    </div>
  </Link>
);

// AI 건강 조언가 컴포넌트 (수정 없음)
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
            <h3 className="notice-title" style={{ marginBottom: '0.75rem' }}> {/* mb-3 */}
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

// 🌟 [수정] App.js에서 'currentUser'를 props로 받습니다.
export default function Home({ currentUser }) {
  
  // 🌟 [추가] DB 데이터를 저장할 상태
  const [notices, setNotices] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [qaPosts, setQaPosts] = useState([]);
  const [recommendedAnimals, setRecommendedAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🌟 [추가] 서버에서 모든 데이터를 가져오는 useEffect
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. 게시글 (공지, 최신글, 질문) 데이터 가져오기
        const postsResponse = await fetch('http://localhost:3001/api/posts');
        if (!postsResponse.ok) throw new Error('게시글 목록을 불러올 수 없습니다.');
        const allPosts = await postsResponse.json();
        
        // 2. 입양 공고 (추천 동물) 데이터 가져오기
        const adoptionResponse = await fetch('http://localhost:3001/api/adoption');
        if (!adoptionResponse.ok) throw new Error('입양 공고를 불러올 수 없습니다.');
        const allAdoptionPosts = await adoptionResponse.json();

        // 3. 데이터 분류 및 상태 업데이트
        const noticePosts = allPosts
          .filter(p => p.isNotice === 1 || p.isNotice === true)
          .slice(0, 5);
        
        const regularPosts = allPosts
          .filter(p => p.isNotice !== 1 && p.isNotice !== true)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 최신순 정렬

        setNotices(noticePosts);
        
        // 🌟 [핵심 수정] '최신글'을 '자유게시판' 카테고리만 필터링
        setLatestPosts(regularPosts.filter(p => p.category === '자유게시판').slice(0, 5));
        
        setQaPosts(regularPosts.filter(p => p.category === '질문답변').slice(0, 4));
        
        // 4. 추천 동물 (랜덤 4개)
        const shuffledAnimals = allAdoptionPosts.sort(() => 0.5 - Math.random());
        setRecommendedAnimals(shuffledAnimals.slice(0, 4));

      } catch (err) {
        console.error("홈페이지 데이터 로딩 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []); // 처음 로드 시 1회 실행

  // 🌟 [추가] 로딩 및 에러 처리 UI
  if (loading) {
    return (
      <div className="home-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#594C3C' }}>
        <style>{styles}</style> {/* 🌟 스타일 태그 추가 */}
        <div className="spinner-large" style={{ borderTopColor: '#735048' }}></div>
        <p style={{ marginTop: '1rem', fontSize: '1.25rem' }}>페이지를 불러오는 중...</p>
      </div>
    );
  }
  if (error) {
     return (
      <div className="home-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{styles}</style> {/* 🌟 스타일 태그 추가 */}
        <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', textAlign: 'center' }}>
            <h2 style={{ color: '#735048', fontSize: '1.5rem', marginBottom: '1rem' }}>데이터 로딩 실패</h2>
            <p style={{ color: '#594C3C', marginBottom: '1.5rem' }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{
                backgroundColor: '#735048', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer'
            }}>
                새로고침
            </button>
        </div>
      </div>
    );
  }
  
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

              {/* 빠른 메뉴 (이제 실제 <Link>로 작동) */}
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
                      <Star className="w-6 h-6 text-icon-color" />
                    </div>
                    <span className="menu-text">용품 리뷰</span>
                  </Link>
                  <Link to="/diary" className="menu-item">
                    <div className="menu-icon-box">
                      <BookOpen className="w-6 h-6 text-icon-color" />
                    </div>
                    <span className="menu-text">반려일기</span>
                  </Link>
                </div>
              </div>

              {/* 질문 게시판 (DB 연동) */}
              <div className="menu-box">
                <div className="section-header">
                  <h2 className="section-title">📝 질문 게시판</h2>
                  <Link to="/board" className="section-link"> {/* 🌟 [수정] /board?category=... -> /board */}
                    더보기 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="question-list-container">
                  {qaPosts.length > 0 ? (
                    qaPosts.map(post => (
                      <QuestionItem 
                        key={post.id}
                        id={post.id} // 🌟 Link를 위해 id 전달
                        title={post.title} 
                        user={post.authorNickname || post.author} // 🌟 닉네임 우선 표시
                        comments={post.comments} 
                      />
                    ))
                  ) : (
                    <p style={{ padding: '1rem 0.5rem', color: '#735048' }}>등록된 질문이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 최신글 (DB 연동) */}
              <div className="menu-box">
                <div className="section-header">
                  <h2 className="section-title">✨ 최신글</h2>
                  <Link to="/board" className="section-link">
                    더보기 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="question-list-container">
                  {latestPosts.length > 0 ? (
                    latestPosts.map(post => (
                      <QuestionItem 
                        key={post.id}
                        id={post.id} // 🌟 Link를 위해 id 전달
                        title={post.title} 
                        user={post.authorNickname || post.author} // 🌟 닉네임 우선 표시
                        comments={post.comments} 
                      />
                    ))
                  ) : (
                     <p style={{ padding: '1rem 0.5rem', color: '#735048' }}>등록된 글이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 오늘의 추천 반려동물 (DB 연동) */}
              <div className="menu-box">
                <div className="section-header">
                  <h2 className="section-title">🐾 오늘의 추천 반려동물</h2>
                  <Link to="/adoption" className="section-link">
                    더보기 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="main-grid grid-cols-4">
                  {recommendedAnimals.length > 0 ? (
                    recommendedAnimals.map((animal) => (
                        <AnimalCard
                          key={animal.id}
                          id={animal.id} 
                          name={animal.name}
                          imageSrc={animal.image || `https://placehold.co/400x400/F2E2CE/594C3C?text=${animal.name}`}
                          // 🌟 [수정] "살"을 붙여서 string으로 전달
                          age={`${animal.age}살`}
                          gender={animal.gender}
                        />
                    ))
                  ) : (
                     <p style={{ padding: '1rem 0.5rem', color: '#735048', gridColumn: 'span 4' }}>추천할 동물이 없습니다.</p>
                  )}
                </div>
              </div>
              
            </div>

            {/* 사이드바 */}
            <aside className="sidebar-section section-spacing">
              
              {/* AI 건강 조언가 */}
              <AiConsultant />

              {/* 공지사항 (사이드바 버전 - DB 연동) */}
              <div className="notice-wrapper sticky-notice">
                <div className="notice-header">
                  <h3 className="notice-title">
                    <Bell className="w-4 h-4" />
                    공지사항
                  </h3>
                  <Link to="/board" className="section-link" style={{ fontSize: '0.75rem' }}> 
                    전체
                  </Link>
                </div>
                <div className="notice-list">
                  {notices.length > 0 ? (
                    notices.map((notice) => (
                        <NoticeItem 
                          key={notice.id}
                          id={notice.id} 
                          title={notice.title} 
                          date={new Date(notice.createdAt).toLocaleDateString('ko-KR').slice(5)} 
                          isNew={ (new Date() - new Date(notice.createdAt)) / (1000 * 60 * 60 * 24) < 3 } 
                        />
                    ))
                  ) : (
                     <p style={{ padding: '1rem 0.5rem', color: '#735048', fontSize: '0.875rem' }}>등록된 공지사항이 없습니다.</p>
                  )}
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