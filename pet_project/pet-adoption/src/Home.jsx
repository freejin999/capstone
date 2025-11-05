import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Carousel from './Carousel'; // 👈 캐러셀 컴포넌트 임포트

// --- Placeholder Components ---
const HandPlaceholder = ({ text = "손 모양" }) => (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg shadow-sm">
    <span className="text-gray-500 text-sm">{text}</span>
  </div>
);

const PetIconPlaceholder = ({ name, imageSrc }) => (
  <div className="flex flex-col items-center">
    {/* 이미지 */}
    <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden mb-2 border-2 border-gray-400">
        <img src={imageSrc} alt={name} className="w-full h-full object-cover"/>
    </div>
    {/* 텍스트 */}
    <span className="text-sm font-medium text-gray-700">{name}</span>
    <span className="text-xs text-gray-500">분류</span>
  </div>
);
// ----------------------------


export default function Home({ isLoggedIn }) { // 👈 isLoggedIn prop을 받습니다.
  const [serverMessage, setServerMessage] = useState('서버 연결 대기 중...');
useEffect(() => {
        // Node.js 서버에 요청 보내기 (http://localhost:3001)
        fetch('http://localhost:3001/api/test')
            .then(res => res.json())
            .then(data => {
                setServerMessage(data.message); // 서버에서 받은 메시지를 저장
            })
            .catch(error => {
                setServerMessage('❌ 서버 연결 실패! Node.js 서버가 실행 중인지 확인하세요.');
            });
    }, []);
  return (
    <div className="min-h-screen bg-white text-gray-800">
      
      {/* 💡 Note: 사이트 공통 Navigation/Footer는 App.js에서 처리합니다. */}

      <main className="max-w-7xl mx-auto px-4 pt-8 pb-16 grid grid-cols-12 gap-8">
        
        {/* 중앙 콘텐츠 (9/12 컬럼) */}
        <section className="col-span-12 lg:col-span-9 space-y-8">
          
          

            <div className="flex items-center space-x-4 text-sm">
              {/* 로그인 상태에 따라 조건부 렌더링 */}
              {isLoggedIn ? (
                <Link to="/mypage" className="hover:text-orange-500">마이페이지</Link>
              ) : (
                <Link to="/login" className="hover:text-orange-500">로그인</Link>
              )}
              
              <div className="border rounded-full flex items-center px-3 py-1 ml-4">
                  <input type="text" placeholder="검색" className="focus:outline-none w-20 text-sm" />
                  <span className="ml-2 text-gray-400">🔍</span>
              </div>
            </div>

          
          {/* 2. 캐러셀/슬라이드 영역 (Carousel 컴포넌트 사용) */}
          <div className="relative h-64 border border-gray-300 rounded-lg overflow-hidden shadow-md"> 
            <Carousel /> 
          </div>
          
          {/* 3. 공지사항 및 추천 동물 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 공지 사항 */}
            <div className="md:col-span-1 space-y-4">
              <h2 className="text-lg font-bold border-b pb-2">공지사항</h2>
              <div className="space-y-4">
                <PetIconPlaceholder name="복돌이" imageSrc="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop" />
                <PetIconPlaceholder name="둥가" imageSrc="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop" />
                <PetIconPlaceholder name="보리" imageSrc="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=400&fit=crop" />
              </div>
            </div>
            
            {/* 오늘의 추천 반려동물 */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-bold border-b pb-2">오늘의 추천 반려동물</h2>
              <div className="grid grid-cols-4 gap-4 pt-4">
                {/* 4개의 손 모양 Placeholder */}
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square">
                    <HandPlaceholder text="" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. 카테고리별 공고 섹션 */}
          <div className="space-y-8">
            
            {/* 강아지 섹션 */}
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">강아지 입양</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {/* 5개의 손 모양 Placeholder */}
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square">
                    <HandPlaceholder text="" />
                  </div>
                ))}
              </div>
            </div>

            {/* 고양이 섹션 */}
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">고양이 입양</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {/* 5개의 손 모양 Placeholder */}
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square">
                    <HandPlaceholder text="" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* 5. 사이드바 (3/12 컬럼) */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="p-4 bg-gray-100 rounded-lg border h-40 flex items-center justify-center">
            <p className="text-gray-500 text-sm">광고<br/>(position fixed)</p>
          </div>
        </aside>

      </main>
      
    </div>
  );
}
