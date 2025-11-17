import React, { useState } from 'react';
import { Send, PawPrint, MessageCircle, RefreshCcw } from 'lucide-react';

// Gemini API 키는 비어있습니다. Canvas 환경에서 자동으로 채워집니다.
const API_KEY = "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

// 💡 시스템 명령: AI의 역할 정의
const SYSTEM_PROMPT = "당신은 반려동물 영양 및 건강 관리 전문가입니다. 사용자의 질문에 대해 명확하고 친절한 어조로, 최신 정보를 기반하여 답변해주세요. 답변은 3~4문장 이내로 요약해 주세요.";

export default function AIAssistant() {
    const [history, setHistory] = useState([]); // 채팅 기록
    const [input, setInput] = useState(''); // 사용자 입력
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateContent = async (userQuery) => {
        if (!userQuery) return;

        setLoading(true);
        setError(null);

        // 사용자의 새 질문을 기록에 추가
        const newUserEntry = { role: 'user', parts: [{ text: userQuery }] };
        setHistory(prev => [...prev, newUserEntry]);

        const chatHistory = [...history, newUserEntry];

        const payload = {
            contents: chatHistory.map(entry => ({
                role: entry.role,
                parts: [{ text: entry.parts[0].text }]
            })),
            
            // 💡 Google Search Grounding 도구 추가 (최신 정보 검색)
            tools: [{ "google_search": {} }],

            // 시스템 명령 설정
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
        };

        // 지수 백오프를 사용하여 API 호출 시도
        const MAX_RETRIES = 3;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                const candidate = result.candidates?.[0];

                if (candidate && candidate.content?.parts?.[0]?.text) {
                    const text = candidate.content.parts[0].text;
                    const sources = candidate.groundingMetadata?.groundingAttributions || [];
                    
                    // AI의 답변과 출처를 기록에 추가
                    setHistory(prev => [...prev, {
                        role: 'model',
                        parts: [{ text: text }],
                        sources: sources
                    }]);
                    setLoading(false);
                    return;
                } else {
                    throw new Error("API 응답에서 유효한 텍스트를 찾을 수 없습니다.");
                }
            } catch (err) {
                console.error(`API 호출 실패 (시도 ${attempt + 1}):`, err);
                if (attempt === MAX_RETRIES - 1) {
                    setError('API 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                    setLoading(false);
                    return;
                }
                // 다음 시도를 위해 지연 (1s, 2s, 4s)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const query = input.trim();
        if (query && !loading) {
            generateContent(query);
            setInput('');
        }
    };
    
    // UI 랜더링 헬퍼
    const renderChatBubble = (entry, index) => {
        const isUser = entry.role === 'user';
        const messageText = entry.parts[0].text;
        
        return (
            <div key={index} className={`chat-bubble-wrapper ${isUser ? 'user' : 'ai'}`}>
                <div className="chat-bubble">
                    <PawPrint className="icon-paw" />
                    <p>{messageText}</p>
                </div>
                {/* 출처 표시 */}
                {entry.sources && entry.sources.length > 0 && (
                    <div className="source-area">
                        <p className="source-header">출처:</p>
                        <ul className="source-list">
                            {entry.sources.slice(0, 3).map((source, idx) => (
                                <li key={idx}>
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer">
                                        {source.title.substring(0, 40)}...
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="ai-assistant-card">
             {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 */}
            {/* ------------------------------------------- */}
            <style>{`
                /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */
                .ai-assistant-card {
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border: 1px solid #F2E2CE;
                    height: 550px; /* 고정 높이 */
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }
                .chat-window {
                    flex-grow: 1;
                    padding: 16px;
                    overflow-y: auto;
                    background-color: #F2EDE4; /* Light Background */
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .chat-bubble-wrapper {
                    display: flex;
                    flex-direction: column;
                    max-width: 85%;
                }
                .chat-bubble-wrapper.user {
                    align-self: flex-end;
                    align-items: flex-end;
                }
                .chat-bubble-wrapper.ai {
                    align-self: flex-start;
                    align-items: flex-start;
                }
                .chat-bubble {
                    padding: 10px 15px;
                    border-radius: 18px;
                    font-size: 15px;
                    color: #594C3C;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                    line-height: 1.4;
                    position: relative;
                }
                .chat-bubble.user {
                    background-color: #F2CBBD; /* Accent Background */
                    border-bottom-right-radius: 4px;
                    padding-left: 36px;
                }
                .chat-bubble.ai {
                    background-color: white;
                    border: 1px solid #F2E2CE;
                    border-bottom-left-radius: 4px;
                    padding-left: 36px;
                }
                .icon-paw {
                    position: absolute;
                    left: 10px;
                    top: 12px;
                    width: 16px;
                    height: 16px;
                    color: #735048; /* Primary Color */
                    fill: #735048;
                }
                
                /* 입력 폼 */
                .input-form {
                    padding: 16px;
                    border-top: 1px solid #F2E2CE;
                    display: flex;
                    gap: 10px;
                    background-color: white;
                }
                .input-text {
                    flex-grow: 1;
                    padding: 10px 16px;
                    border: 1px solid #F2CBBD;
                    border-radius: 20px;
                    font-size: 16px;
                }
                .input-text:focus {
                    outline: none;
                    border-color: #735048;
                }
                .send-button {
                    background-color: #735048;
                    color: white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.15s;
                }
                .send-button:hover:not(:disabled) {
                    background-color: #594C3C;
                }
                .send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                /* 로딩/에러 */
                .loading-spinner {
                    text-align: center;
                    color: #735048;
                    font-size: 14px;
                }
                .error-message {
                    color: #c23939;
                    background-color: #fcebeb;
                    padding: 8px;
                    border-radius: 8px;
                    text-align: center;
                }
                
                /* 출처 스타일 */
                .source-area {
                    margin-top: 5px;
                    padding: 5px 10px;
                    background-color: #f5f5f5;
                    border-radius: 8px;
                    border: 1px solid #eee;
                    font-size: 12px;
                    color: #594C3C;
                    max-width: 100%;
                }
                .source-header {
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #735048;
                }
                .source-list {
                    list-style-type: disc;
                    margin-left: 20px;
                    padding-left: 0;
                }
                .source-list a {
                    color: #4f46e5;
                    text-decoration: none;
                }
            `}</style>
            
            <header style={{ padding: '10px 16px', borderBottom: '1px solid #F2E2CE', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageCircle className="w-6 h-6" style={{ color: '#735048' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#594C3C' }}>AI 건강 조언가</h2>
            </header>

            <div className="chat-window">
                {history.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#A0A0A0', padding: '50px 0' }}>
                        <PawPrint style={{ width: '30px', height: '30px', margin: '0 auto 10px' }} />
                        <p>반려동물 건강에 대해 무엇이든 물어보세요!</p>
                        <p style={{fontSize: '12px', marginTop: '5px'}}>예: 강아지 설사할 때 뭘 먹여야 하나요?</p>
                    </div>
                )}
                {history.map(renderChatBubble)}
                
                {loading && (
                    <div className="loading-spinner">
                        <RefreshCcw className="w-5 h-5 animate-spin" style={{ color: '#735048' }} />
                        <p>답변 생성 중...</p>
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
            </div>

            <form className="input-form" onSubmit={handleFormSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="강아지에게 좋은 간식이 궁금해요."
                    className="input-text"
                    disabled={loading}
                />
                <button type="submit" className="send-button" disabled={loading || !input.trim()}>
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}