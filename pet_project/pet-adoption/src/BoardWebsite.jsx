import React, { useState, useEffect } from 'react'; // 1. useEffect 임포트
import { Search, Plus, Eye, MessageSquare, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
// import { Link } from 'react-router-dom'; // [수정] react-router-dom의 Link 임포트 제거

// [추가] react-router-dom의 Link가 Router Context 없이 실행되어 발생하는 오류를
// 방지하기 위해, 일반 <a> 태그로 동작하는 임시 Link 컴포넌트를 정의합니다.
// (주의: 이 방식은 SPA 동작 대신 전체 페이지 새로고침을 유발합니다.)
const Link = (props) => {
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a href={props.to} {...props} className={props.className}>{props.children}</a>;
};


export default function BoardWebsite() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 2. DB에서 가져온 데이터를 저장할 상태 (초기값은 빈 배열)
  const [posts, setPosts] = useState([]); 

  const categories = ['전체', '공지사항', '자유게시판', '질문답변', 'FAQ'];

  // 3. [삭제] const initialPosts = [...] (기존 더미 데이터는 삭제함)

  // 4. [추가] 서버에서 데이터를 가져오는 useEffect
  useEffect(() => {
    // 서버에서 게시글 목록을 가져오는 비동기 함수
    const fetchPosts = async () => {
      try {
        // 1. 서버 API 호출 (백엔드 서버는 3001 포트)
        //    (기존 코드의 /api/posts 경로를 사용합니다)
        const response = await fetch('http://localhost:3001/api/posts');
        
        if (!response.ok) {
          throw new Error('서버에서 데이터를 가져오지 못했습니다.');
        }
        
        const dbData = await response.json(); // DB에서 온 원본 데이터

        // 2. [중요] DB 데이터와 UI가 요구하는 데이터 형식이 다릅니다.
        //    DB에는 'category', 'views' 등이 없으므로, UI가 깨지지 않게
        //    임시로 기본값을 추가해줍니다.
        // [수정] post.createdAt이 null일 경우를 대비하여 방어 코드 추가
        const formattedData = dbData.map(post => ({
          ...post, // DB에서 온 데이터 (id, title, content, author, createdAt)
          category: post.category || '자유게시판', // DB에 없으므로 임시값
          date: post.createdAt ? post.createdAt.slice(0, 10) : '날짜없음', // createdAt을 date 형식으로
          views: post.views || 0,
          likes: post.likes || 0,
          comments: post.comments || 0,
          isNotice: post.isNotice || false,
        }));

        // 3. 서버에서 받은 데이터로 'posts' 상태를 업데이트
        setPosts(formattedData);

      } catch (error) {
        console.error("게시글 로딩 실패:", error);
      }
    };

    fetchPosts(); // 함수 실행
  }, []); // [] : 컴포넌트가 처음 로드될 때 1번만 실행

  
  // --- (이하 코드는 기존 로직과 거의 동일) ---
  // 이제 'posts' 상태는 DB에서 온 실제 데이터를 기반으로 작동합니다.

  const postsPerPage = 10;

  // [수정] post.title 또는 post.author가 null일 경우를 대비하여 방어 코드 추가
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
    <div className="min-h-screen bg-gray-50">
      {/* Header (기존과 동일) */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">커뮤니티 게시판 (DB 연동됨)</h1>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900">로그인</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                회원가입
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (기존과 동일) */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs (기존과 동일) */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-6 py-4 font-medium whitespace-nowrap transition ${selectedCategory === category
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Write Button (기존과 동일) */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="제목, 작성자로 검색하세요"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Link to="/board/write" //  이동할 경로 지정
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            글쓰기
          </Link>
        </div>

        {/* Board List (기존과 동일) */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header (기존과 동일) */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b font-medium text-gray-700">
            <div className="col-span-1 text-center">번호</div>
            <div className="col-span-2">카테고리</div>
            <div className="col-span-5">제목</div>
            <div className="col-span-2">작성자</div>
            <div className="col-span-1 text-center">조회</div>
            <div className="col-span-1 text-center">날짜</div>
          </div>

          {/* Notice Posts (공지사항 렌더링) */}
          {noticePosts.map(post => (
            <div
              key={post.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-gray-50 transition cursor-pointer bg-blue-50"
            >
               <div className="md:col-span-1 flex md:justify-center items-center">
                 <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">공지</span>
               </div>
               <div className="md:col-span-2 flex items-center">
                 <span className="text-sm text-blue-600 font-medium">{post.category}</span>
               </div>
               <div className="md:col-span-5 flex items-center gap-2">
                 <Link to={`/board/${post.id}`} className="hover:text-blue-600">
                   {post.title}
                 </Link>
                 <span className="flex items-center gap-1 text-sm text-gray-500">
                   <MessageSquare className="w-4 h-4" />
                   {post.comments}
                 </span>
               </div>
               {/* [수정] 빠뜨린 작성자 div 추가 */}
               <div className="md:col-span-2 flex items-center text-sm text-gray-600">
                 {post.author}
               </div>
               <div className="md:col-span-1 flex md:justify-center items-center text-sm text-gray-500">
                 <Eye className="w-4 h-4 mr-1" />
                 {post.views}
               </div>
               <div className="md:col-span-1 flex md:justify-center items-center text-sm text-gray-500">
                 {/* [수정] post.date가 없을 경우 post.createdAt을 사용하도록 수정 */}
                 {post.date ? post.date.slice(5) : (post.createdAt ? post.createdAt.slice(5, 10) : '날짜없음')}
               </div>
            </div>
            // [수정] ❌ 여분의 </div> 태그 삭제
          ))}

          {/* Regular Posts (일반 게시글 렌더링) */}
          {currentPosts.map(post => (
            <div
              key={post.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="md:col-span-1 flex md:justify-center items-center text-gray-500">
                {post.id}
              </div>
              <div className="md:col-span-2 flex items-center">
                <span className="text-sm text-gray-600">{post.category}</span>
              </div>
              <div className="md:col-span-5 flex items-center gap-2">
                <Link to={`/board/${post.id}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  {post.comments}
                </span>
                <span className="flex items-center gap-1 text-sm text-red-500">
                  <ThumbsUp className="w-4 h-4" />
                  {post.likes}
                </span>
              </div>
              <div className="md:col-span-2 flex items-center text-sm text-gray-600">
                {post.author}
              </div>
              {/* [수정] 'md:col-stop-1' 오타를 'md:col-span-1'로 수정 */}
              <div className="md:col-span-1 flex md:justify-center items-center text-sm text-gray-500">
                {post.views}
              </div>
              <div className="md:col-span-1 flex md:justify-center items-center text-sm text-gray-500">
                {/* [수정] post.date가 없을 경우 post.createdAt을 사용하도록 수정 */}
                {post.date ? post.date.slice(5) : (post.createdAt ? post.createdAt.slice(5, 10) : '날짜없음')}
              </div>
            </div>
          ))}
          
          {/* 게시글이 없을 때 표시 */}
          {posts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              아직 등록된 게시글이 없습니다.
            </div>
          )}

        </div>

        {/* Pagination (기존과 동일) */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'border hover:bg-gray-50'
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Footer (기존과 동일) */}
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 커뮤니티 게시판. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}