import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, MessageSquare, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BoardWebsite() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [posts, setPosts] = useState([]);  // DB에서 가져온 데이터를 저장
    const [refreshFlag, setRefreshFlag] = useState(false); // 자동 새로고침 플래그

    const categories = ['전체', '공지사항', '자유게시판', '질문답변', '중고거래'];

    // --- 데이터 로딩 로직 ---
    useEffect(() => {
        fetchPosts();
    }, [refreshFlag]); // refreshFlag가 변경될 때마다 실행

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/posts');
            if (!response.ok) {
                throw new Error('서버에서 데이터를 가져오지 못했습니다.');
            }
            const dbData = await response.json();

            // DB 데이터 형식을 UI에 맞게 가공
            const formattedData = dbData.map(post => ({
                ...post,
                category: post.category || '자유게시판',
                date: post.createdAt ? post.createdAt.slice(0, 10) : (post.date || '날짜없음'),
                views: post.views || 0,
                likes: post.likes || 0,
                comments: post.comments || 0,
                isNotice: post.category === '공지사항', // 카테고리 기반으로 공지 여부 결정
                // post.likedUsers는 이미 서버에서 파싱되어 왔다고 가정
            }));

            setPosts(formattedData);

        } catch (error) {
            console.error("게시글 로딩 실패:", error);
        }
    };
    // --- 데이터 로딩 로직 끝 ---


    const postsPerPage = 10;
    
    // 필터링 로직
    const filteredPosts = posts.filter(post => {
        const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
        const matchesSearch = (post.title && typeof post.title === 'string' && post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (post.author && typeof post.author === 'string' && post.author.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const noticePosts = filteredPosts.filter(post => post.isNotice);
    const regularPosts = filteredPosts.filter(post => !post.isNotice);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = regularPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(regularPosts.length / postsPerPage);

    return (
        <div className="board-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 */}
            {/* ------------------------------------------- */}
            <style>{`
                /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */

                .board-container {
                    min-height: 100vh;
                    background-color: #F2EDE4; /* Light Background */
                    padding: 30px 0;
                    font-family: 'Inter', sans-serif;
                }
                .main-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 16px;
                }
                .board-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #735048; /* Primary Color */
                    margin-bottom: 20px;
                }
                /* 카테고리 탭 */
                .category-tabs {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    margin-bottom: 24px;
                    display: flex;
                    overflow-x: auto;
                    border: 1px solid #F2E2CE;
                }
                .category-button {
                    padding: 12px 20px;
                    font-weight: 500;
                    white-space: nowrap;
                    transition: background-color 0.15s, color 0.15s;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #594C3C;
                }
                .category-button:hover {
                    background-color: #F2E2CE; /* Light Accent Hover */
                }
                .category-button.active {
                    color: #735048; /* Primary Color */
                    border-bottom: 2px solid #735048;
                    font-weight: 700;
                }

                /* 검색 및 작성 버튼 */
                .search-area {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .search-input-wrapper {
                    flex: 1;
                    position: relative;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 20px;
                    height: 20px;
                    color: #A0A0A0;
                }
                .search-input {
                    width: 100%;
                    padding: 12px 12px 12px 40px;
                    border: 1px solid #F2CBBD;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                }
                .write-button {
                    background-color: #735048; /* Primary Color */
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                    transition: background-color 0.15s;
                    text-decoration: none;
                }
                .write-button:hover {
                    background-color: #594C3C; /* Darker Brown */
                }
                
                /* 게시글 목록 테이블 */
                .post-list {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    border: 1px solid #F2E2CE;
                }
                .table-header {
                    display: none; /* 모바일에서 숨김 */
                    padding: 12px 24px;
                    background-color: #F2EDE4; /* Light Accent Background */
                    border-bottom: 1px solid #F2E2CE;
                    font-weight: 600;
                    color: #594C3C;
                }
                @media (min-width: 768px) {
                    .table-header {
                        display: grid;
                        grid-template-columns: repeat(12, 1fr);
                        gap: 16px;
                    }
                }
                .post-row {
                    padding: 12px 24px;
                    border-bottom: 1px solid #F2E2CE;
                    cursor: pointer;
                    transition: background-color 0.15s;
                    color: #594C3C;
                }
                .post-row:hover {
                    background-color: #F2E2CE;
                }
                @media (min-width: 768px) {
                    .post-row {
                        display: grid;
                        grid-template-columns: repeat(12, 1fr);
                        gap: 16px;
                    }
                }
                .link-style {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }
                .post-title-link {
                    font-weight: 500;
                    color: #735048; /* Primary Color */
                    transition: color 0.15s;
                }
                .post-title-link:hover {
                    text-decoration: underline;
                    color: #594C3C;
                }

                .notice-row {
                    background-color: #fff7f2; /* Light Peach for Notice */
                    font-weight: 600;
                    border-left: 4px solid #735048;
                }
                .notice-badge {
                    background-color: #735048;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                
                /* 페이지네이션 */
                .pagination-area {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    margin-top: 24px;
                }
                .page-button {
                    padding: 8px 12px;
                    border-radius: 6px;
                    border: 1px solid #F2E2CE;
                    background-color: white;
                    cursor: pointer;
                    transition: background-color 0.15s;
                    color: #594C3C;
                    font-weight: 500;
                }
                .page-button:hover:not(:disabled) {
                    background-color: #F2E2CE;
                }
                .page-button.active {
                    background-color: #735048;
                    color: white;
                    border-color: #735048;
                }
                .page-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
            
            <main className="main-content">
                <h1 className="board-title">커뮤니티 게시판</h1>

                {/* Category Tabs */}
                <div className="category-tabs">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                setCurrentPage(1);
                            }}
                            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Search and Write Button */}
                <div className="search-area">
                    <div className="search-input-wrapper">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="제목, 작성자로 검색하세요"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="search-input"
                        />
                    </div>
                    <Link to="/board/write" className="write-button">
                        <Plus className="w-5 h-5" />
                        글쓰기
                    </Link>
                </div>

                {/* Board List */}
                <div className="post-list">
                    {/* Table Header */}
                    <div className="table-header">
                        <div style={{gridColumn: '1/2', textAlign: 'center'}}>번호</div>
                        <div style={{gridColumn: '2/4'}}>카테고리</div>
                        <div style={{gridColumn: '4/9'}}>제목</div>
                        <div style={{gridColumn: '9/11'}}>작성자</div>
                        <div style={{gridColumn: '11/12', textAlign: 'center'}}>조회</div>
                        <div style={{gridColumn: '12/13', textAlign: 'center'}}>날짜</div>
                    </div>

                    {/* Notice Posts */}
                    {noticePosts.map(post => (
                        <Link 
                            to={`/board/${post.id}`} 
                            key={post.id}
                            className="post-row notice-row"
                        >
                            <div style={{gridColumn: '1/2', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><span className="notice-badge">공지</span></div>
                            <div style={{gridColumn: '2/4', display: 'flex', alignItems: 'center'}}>{post.category}</div>
                            <div style={{gridColumn: '4/9', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span className="post-title-link">{post.title}</span>
                                <span style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#735048'}}>
                                    <MessageSquare className="w-4 h-4" />
                                    {post.comments}
                                </span>
                            </div>
                            <div style={{gridColumn: '9/11', display: 'flex', alignItems: 'center', fontSize: '14px'}}>{post.author}</div>
                            <div style={{gridColumn: '11/12', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px'}}>{post.views}</div>
                            <div style={{gridColumn: '12/13', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px'}}>{post.date ? post.date.slice(5) : '날짜없음'}</div>
                        </Link>
                    ))}

                    {/* Regular Posts */}
                    {currentPosts.map(post => (
                        <Link
                            to={`/board/${post.id}`}
                            key={post.id}
                            className="post-row"
                        >
                            <div style={{gridColumn: '1/2', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{post.id}</div>
                            <div style={{gridColumn: '2/4', display: 'flex', alignItems: 'center'}}>{post.category}</div>
                            <div style={{gridColumn: '4/9', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span className="post-title-link">{post.title}</span>
                                <span style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#735048'}}>
                                    <MessageSquare className="w-4 h-4" />
                                    {post.comments}
                                </span>
                                <span style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#F2CBBD'}}>
                                    <ThumbsUp className="w-4 h-4" />
                                    {post.likes}
                                </span>
                            </div>
                            <div style={{gridColumn: '9/11', display: 'flex', alignItems: 'center', fontSize: '14px'}}>{post.author}</div>
                            <div style={{gridColumn: '11/12', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px'}}>{post.views}</div>
                            <div style={{gridColumn: '12/13', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px'}}>
                                {post.date ? post.date.slice(5) : (post.createdAt ? post.createdAt.slice(5, 10) : '날짜없음')}
                            </div>
                        </Link>
                    ))}
                    
                    {/* 게시글이 없을 때 표시 */}
                    {posts.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            아직 등록된 게시글이 없습니다.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="pagination-area">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="page-button"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="page-button"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </main>
        </div>
    );
}