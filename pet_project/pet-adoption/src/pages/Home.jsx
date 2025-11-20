import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Bell, Heart, Bot, Star, MessageSquare, BookOpen, RefreshCw, Send, Image } from 'lucide-react';

import bannerImg1 from '../assets/images/banner1.jpg'; 
import bannerImg2 from '../assets/images/banner2.jpg'; 
import bannerImg3 from '../assets/images/banner3.jpg'; 

import fallbackLogo from '../assets/images/logo.png'; 
const FALLBACK_LOGO_URL = fallbackLogo; 


// --- CSS Block for Styling ---
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

/* 🌟 Carousel Styles */
.carousel-wrapper {
  height: 20rem; 
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  position: relative;
}
.slide-item {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  transition: opacity 700ms;
  background-size: cover;
  background-position: center 40%;
}
.slide-overlay {
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);
    display: flex;
    align-items: center; 
}
.slide-content {
    padding: 2rem 3rem; 
    color: white;
    width: 60%; 
}
.slide-title {
    font-size: 2.25rem; /* text-4xl */
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}
.slide-subtitle {
    font-size: 1.125rem; /* text-xl */
    font-weight: 400;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

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
  border: none;
}
.dot-active {
  background-color: white;
  width: 1.5rem;
}

.card-wrapper {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  transition: box-shadow 150ms;
  cursor: pointer;
  text-decoration: none;
}
.card-wrapper:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06);
}
.card-image-box {
  aspect-ratio: 1 / 1;
  background-color: #f3f4f6;
  overflow: hidden;
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms;
}
.card-wrapper:hover .card-image {
  transform: scale(1.05);
}
.card-info {
  padding: 0.75rem;
}
.card-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #594C3C;
}
.card-meta {
  font-size: 0.75rem;
  color: #735048;
}
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
@media (min-width: 640px) {
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
  background-color: #F2E2CE;
}
.menu-icon-box {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  background-color: #F2E2CE;
}
.menu-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #594C3C;
}
.notice-wrapper {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  padding: 1rem;
}
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
  color: #594C3C;
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
  background-color: #F2E2CE;
}
.notice-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}
.notice-new-tag {
  font-size: 0.75rem;
  background-color: #F2CBBD;
  color: #594C3C;
  padding: 0 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600; 
}
.notice-text {
  font-size: 0.875rem;
  color: #594C3C;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notice-date {
  font-size: 0.75rem;
  color: #735048;
}
.question-list-container {
    display: flex;
    flex-direction: column;
}
.question-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #F2E2CE;
    cursor: pointer;
    transition: background-color 150ms;
    text-decoration: none; 
}
.question-item:last-child {
    border-bottom: none;
}
.question-item:hover {
    background-color: #F2E2CE;
}
.question-left-content {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
}
.question-image-indicator {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    overflow: hidden;
    margin-right: 0.75rem;
    flex-shrink: 0; 
    background-color: #F2E2CE;
    border: 1px solid #F2CBBD; 
    display: flex;
    align-items: center;
    justify-content: center;
}
.question-thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.question-title {
    flex: 1;
    font-size: 0.875rem;
    color: #594C3C;
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
    color: #735048;
    gap: 0.75rem;
    white-space: nowrap; 
}
.question-user {
}
.question-comments {
    white-space: nowrap;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #594C3C;
}
.section-link {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #735048;
  text-decoration: none;
  transition: color 150ms;
}
.section-link:hover {
  color: #594C3C;
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
@media (min-width: 640px) {
  .grid-cols-5 {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
.text-icon-color { color: #594C3C; }
.ad-banner {
    background: linear-gradient(to bottom right, #F2EDE4, #F2E2CE);
    border-radius: 0.5rem;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
}
.ad-text-1 { color: #735048; font-size: 0.875rem; margin-bottom: 0.5rem; }
.ad-text-2 { color: #735048; font-size: 0.75rem; }

.ad-banner a {
    text-decoration: none;
}
.ai-consultant-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  padding: 1rem;
}
.ai-input {
  width: 90%;
  padding: 0.75rem;
  border: 1px solid #F2E2CE;
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

.ai-button-group {
    display: flex;
    gap: 0.5rem;
}
.ai-button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.375rem;
  transition: background-color 150ms;
  cursor: pointer;
  border: none; 
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.ai-button.primary {
    background-color: #735048;
    color: white;
}
.ai-button.primary:hover:not(:disabled) {
    background-color: #594C3C;
}
.ai-button.secondary {
    background-color: #F2E2CE;
    color: #735048;
}
.ai-button.secondary:hover:not(:disabled) {
    background-color: #F2CBBD;
}
.ai-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-response-box {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #F2EDE4;
  border: 1px dashed #F2CBBD;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #594C3C;
  white-space: pre-wrap;
  max-height: 250px; 
  overflow-y: auto;
  line-height: 1.6; 
}
.ai-response-box::-webkit-scrollbar {
    width: 8px;
}
.ai-response-box::-webkit-scrollbar-track {
    background: #F2EDE4; 
    border-radius: 4px;
}
.ai-response-box::-webkit-scrollbar-thumb {
    background: #F2CBBD; 
    border-radius: 4px;
}
.ai-response-box::-webkit-scrollbar-thumb:hover {
    background: #735048; 
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


const apiKey = ""; 

const callGeminiApi = async (prompt) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const systemPrompt = "당신은 반려동물 전문가입니다. 사용자의 질문에 대해 명확하고 도움이 되는 답변을 제공하며, 항상 사용자 친화적이고 공감하는 태도를 유지해야 합니다. 전문적인 조언이 필요한 경우, 수의사와 상담하도록 안내하세요. 답변은 한국어로 제공합니다.";
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
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

function Carousel() {
  const slides = [
    { 
        id: 1, 
        title: <>다양한 정보!<br />다양한 만남!</>, 
        subtitle: <>이곳에서 많은 정보와<br />반려인들을 만나보세요!</>,
        imageUrl: bannerImg1
    },
    { 
        id: 2, 
        title: "새로운 인연을 기다리는 마음", 
        subtitle: "따뜻한 가족을 만날 날을 조용히 기다리고 있어요.",
        imageUrl: bannerImg2
    },
    { 
        id: 3, 
        title: "소중한 순간을 기록하세요", 
        subtitle: "반려동물 일기장으로 매일의 추억을 간직하세요.",
        imageUrl: bannerImg3
    },
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
          className="slide-item"
          style={{ 
              backgroundImage: `url(${slide.imageUrl})`, 
              opacity: index === currentSlide ? 1 : 0 
          }}
        >
            <div className="slide-overlay">
                <div className="slide-content">
                    <h2 className="slide-title">{slide.title}</h2>
                    <p className="slide-subtitle">{slide.subtitle}</p>
                </div>
            </div>
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

const AnimalCard = ({ id, name, imageSrc, age, gender }) => (
  <Link to={`/adoption/${id}`} className="card-wrapper">
    <div className="card-image-box">
      <img src={imageSrc} alt={name} className="card-image"/>
    </div>
    <div className="card-info">
      <h3 className="card-title">{name}</h3>
      <p className="card-meta">{age} · {gender}</p>
    </div>
  </Link>
);

const NoticeItem = ({ id, title, date, isNew }) => (
  <Link to={`/board/${id}`} className="notice-item">
    <div className="notice-left">
      {isNew && <span className="notice-new-tag">N</span>}
      <span className="notice-text">{title}</span>
    </div>
    <span className="notice-date">{date}</span>
  </Link>
);

const QuestionItem = ({ id, title, user, comments, imageSrc }) => (
  <Link to={`/board/${id}`} className="question-item">
    <div className="question-left-content"> 
        {imageSrc ? (
            <div className="question-image-indicator">
                <img 
                    src={imageSrc} 
                    alt="Post thumbnail" 
                    className="question-thumbnail-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_LOGO_URL; }} 
                />
            </div>
        ) : null}
        <span className="question-title">{title}</span>
    </div>
    <div className="question-meta">
      <span className="question-user">{user}</span>
      <span className="question-comments">💬 {comments}</span>
    </div>
  </Link>
);

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

    const handleReset = () => {
        setQuestion('');
        setResponse(null);
        setLoading(false);
    };

    return (
        <div className="ai-consultant-card">
            <h3 className="notice-title" style={{ marginBottom: '0.75rem' }}>
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
                <div className="ai-button-group">
                    <button
                        type="submit"
                        className="ai-button primary"
                        disabled={loading || !question.trim()}
                    >
                        {loading ? '답변 생성 중...' : <> <Send className="w-4 h-4"/> 조언 요청 </>}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="ai-button secondary"
                        disabled={loading || (!question && !response)}
                    >
                        <RefreshCw className="w-4 h-4"/> 초기화
                    </button>
                </div>
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

export default function Home({ currentUser }) {
  
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [qaPosts, setQaPosts] = useState([]);
  const [recommendedAnimals, setRecommendedAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const postsResponse = await fetch('http://localhost:3001/api/posts');
        if (!postsResponse.ok) throw new Error('게시글 목록을 불러올 수 없습니다.');
        const allPosts = await postsResponse.json();
        
        const adoptionResponse = await fetch('http://localhost:3001/api/adoption');
        if (!adoptionResponse.ok) throw new Error('입양 공고를 불러올 수 없습니다.');
        const allAdoptionPosts = await adoptionResponse.json();

        const noticePosts = allPosts
          .filter(p => p.isNotice === 1 || p.isNotice === true)
          .slice(0, 5);
        
        const regularPosts = allPosts
          .filter(p => p.isNotice !== 1 && p.isNotice !== true)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); 

        setNotices(noticePosts);
        setLatestPosts(regularPosts.filter(p => p.category === '자유게시판').slice(0, 5));
        setQaPosts(regularPosts.filter(p => p.category === '질문게시판').slice(0, 4));
        
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
  }, []); 

  if (loading) {
    return (
      <div className="home-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#594C3C' }}>
        <style>{styles}</style> 
        <div className="spinner-large" style={{ borderTopColor: '#735048' }}></div>
        <p style={{ marginTop: '1rem', fontSize: '1.25rem' }}>페이지를 불러오는 중...</p>
      </div>
    );
  }
  if (error) {
     return (
      <div className="home-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{styles}</style> 
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
            
            <div className="main-section section-spacing">
              
              <div className="carousel-wrapper">
                <Carousel />
              </div>

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
                  <Link 
                    to="/diary" 
                    className="menu-item"
                    onClick={(e) => {
                        if (!currentUser) {
                            e.preventDefault();
                            alert('로그인이 필요한 서비스입니다.');
                            navigate('/login');
                        }
                    }}
                  >
                    <div className="menu-icon-box">
                      <BookOpen className="w-6 h-6 text-icon-color" />
                    </div>
                    <span className="menu-text">반려일기</span>
                  </Link>
                </div>
              </div>

              <div className="menu-box">
                <div className="section-header">
                  <h2 className="section-title">📝 질문 게시판</h2>
                  <Link to="/board" state={{ category: '질문게시판' }} className="section-link"> 
                    더보기 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="question-list-container">
                  {qaPosts.length > 0 ? (
                    qaPosts.map(post => (
                      <QuestionItem 
                        key={post.id}
                        id={post.id} 
                        title={post.title} 
                        user={post.authorNickname || post.author} 
                        comments={post.comments}
                        imageSrc={post.image} 
                      />
                    ))
                  ) : (
                    <p style={{ padding: '1rem 0.5rem', color: '#735048' }}>등록된 질문이 없습니다.</p>
                  )}
                </div>
              </div>

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
                        id={post.id} 
                        title={post.title} 
                        user={post.authorNickname || post.author} 
                        comments={post.comments}
                        imageSrc={post.image}
                      />
                    ))
                  ) : (
                     <p style={{ padding: '1rem 0.5rem', color: '#735048' }}>등록된 글이 없습니다.</p>
                  )}
                </div>
              </div>

              <div className="menu-box">
                <div className="section-header">
                  <h2 className="section-title">🐾 오늘의 만남</h2>
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
                          imageSrc={animal.image || FALLBACK_LOGO_URL}
                          age={`${animal.age}살`}
                          gender={animal.gender}
                        />
                    ))
                  ) : (
                     <p style={{ padding: '1rem 0.5rem', color: '#735048', gridColumn: 'span 4' }}>아직 소개할 아이들이 없습니다.</p>
                  )}
                </div>
              </div>
              
            </div>

            <aside className="sidebar-section section-spacing">
              
              <AiConsultant />

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

              <div className="ad-banner">
                <a href='https://www.kiwu.ac.kr/'>
                  <p className="ad-text-1">반려동물 보험, 첫 달 보험료 50% 할인 혜택!</p>
                  <p className="ad-text-2">클릭하고 우리 아이 건강 지켜주세요.</p>
                </a>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}