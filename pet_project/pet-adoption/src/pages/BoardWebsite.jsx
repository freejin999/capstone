import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, MessageSquare, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom'; // 🌟 useLocation 추가

// 🌟 [핵심] CSS 파일 임포트
import './BoardWebsite.css';

export default function BoardWebsite() {
    const location = useLocation(); // 🌟 location 정보 가져오기
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // 🌟 초기값 설정: location.state에 category가 있으면 그것을 사용, 없으면 '전체'
    const [selectedCategory, setSelectedCategory] = useState(location.state?.category || '전체');
    
    const [posts, setPosts] = useState([]); 
    const [refreshFlag, setRefreshFlag] = useState(false);

    const categories = ['전체', '공지사항', '자유게시판', '질문게시판', '중고거래'];

    // 🌟 location.state가 변경될 때마다 카테고리 업데이트 (필요시)
    useEffect(() => {
        if (location.state?.category) {
            setSelectedCategory(location.state.category);
        }
    }, [location.state]);

    // 데이터 불러오기
    useEffect(() => {
        fetchPosts();
    }, [refreshFlag]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/posts');
            if (!response.ok) {
                throw new Error('서버에서 데이터를 가져오지 못했습니다.');
            }
            const dbData = await response.json();

            const formattedData = dbData.map(post => ({
                ...post,
                category: post.category || '자유게시판',
                date: post.createdAt ? post.createdAt.slice(0, 10) : (post.date || '날짜없음'),
                views: post.views || 0,
                likes: post.likes || 0,
                comments: post.comments || 0,
                isNotice: post.isNotice === 1 || post.isNotice === true,
                image: post.image, // 🌟 이미지 데이터 포함
            }));

            setPosts(formattedData);
        } catch (error) {
            console.error("게시글 로딩 실패:", error);
        }
    };

    const postsPerPage = 10;
    
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
            <main className="main-content">
                <h1 className="board-title">커뮤니티 게시판</h1>

                {/* 카테고리 탭 */}
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

                {/* 검색 및 글쓰기 버튼 */}
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
                    {/* 🌟 [수정] 글쓰기 버튼 클릭 시 현재 선택된 카테고리 정보를 state로 전달 */}
                    <Link 
                        to="/board/write" 
                        state={{ category: selectedCategory }} 
                        className="write-button"
                    >
                        <Plus className="w-5 h-5" />
                        글쓰기
                    </Link>
                </div>

                {/* 게시글 목록 */}
                <div className="post-list">
                    {/* 테이블 헤더 (PC용) */}
                    <div className="table-header">
                        <div style={{gridColumn: '1/2', textAlign: 'center'}}>번호</div>
                        <div style={{gridColumn: '2/4'}}>카테고리</div>
                        <div style={{gridColumn: '4/9'}}>제목</div>
                        <div style={{gridColumn: '9/11'}}>작성자</div>
                        <div style={{gridColumn: '11/12', textAlign: 'center'}}>조회</div>
                        <div style={{gridColumn: '12/13', textAlign: 'center'}}>날짜</div>
                    </div>

                    {/* 공지사항 목록 */}
                    {noticePosts.map(post => (
                        <Link to={`/board/${post.id}`} key={post.id} className="link-style">
                            <div className="post-row notice-row">
                                <div style={{gridColumn: '1/2', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <span className="notice-badge">공지</span>
                                </div>
                                <div style={{gridColumn: '2/4', display: 'flex', alignItems: 'center'}}>
                                    {post.category}
                                </div>
                                <div style={{gridColumn: '4/9', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    {/* 🌟 이미지가 있으면 썸네일 표시 */}
                                    {post.image && (
                                        <img src={post.image} alt="썸네일" className="post-thumbnail" />
                                    )}
                                    
                                    <span className="post-title-link">{post.title}</span>
                                    
                                    <span style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#735048'}}>
                                        <MessageSquare className="w-4 h-4" />
                                        {post.comments}
                                    </span>
                                </div>
                                <div style={{gridColumn: '9/11', display: 'flex', alignItems: 'center', fontSize: '14px'}}>
                                    {post.author}
                                </div>
                                <div style={{gridColumn: '11/12', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px'}}>
                                    {post.views}
                                </div>
                                <div style={{gridColumn: '12/13', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px'}}>
                                    {post.date ? post.date.slice(5) : '날짜없음'}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* 일반 게시글 목록 */}
                    {currentPosts.map(post => (
                        <Link to={`/board/${post.id}`} key={post.id} className="link-style">
                            <div className="post-row">
                                <div style={{gridColumn: '1/2', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    {post.id}
                                </div>
                                <div style={{gridColumn: '2/4', display: 'flex', alignItems: 'center'}}>
                                    {post.category}
                                </div>
                                <div style={{gridColumn: '4/9', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    {/* 🌟 이미지가 있으면 썸네일 표시 */}
                                    {post.image && (
                                        <img src={post.image} alt="썸네일" className="post-thumbnail" />
                                    )}

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
                                <div style={{gridColumn: '9/11', display: 'flex', alignItems: 'center', fontSize: '14px'}}>
                                    {post.author}
                                </div>
                                <div style={{gridColumn: '11/12', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px'}}>
                                    {post.views}
                                </div>
                                <div style={{gridColumn: '12/13', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px'}}>
                                    {post.date ? post.date.slice(5) : (post.createdAt ? post.createdAt.slice(5, 10) : '날짜없음')}
                                </div>
                            </div>
                        </Link>
                    ))}
                    
                    {posts.length === 0 && (
                        <div style={{textAlign: 'center', padding: '48px 0', color: '#594C3C'}}>
                            아직 등록된 게시글이 없습니다.
                        </div>
                    )}
                </div>

                {/* 페이지네이션 */}
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