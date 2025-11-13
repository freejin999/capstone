import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Send, AlertCircle, Dog, Cat, Bird, User, Calendar, MapPin } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetAdoptionDetail({ currentUser }) {
    const { id } = useParams(); // URL에서 공고 ID 가져오기
    const navigate = useNavigate();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // 2. 💡 입양 신청 버튼 로딩 상태

    // 3. 💡 DB에서 공고 1개 불러오기
    useEffect(() => {
        fetchAdoptionPost(id);
    }, [id]);

    const fetchAdoptionPost = async (postId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/adoption/${postId}`);
            if (response.ok) {
                const data = await response.json();
                setPost(data);
            } else if (response.status === 404) {
                setError('해당 입양 공고를 찾을 수 없습니다.');
            } else {
                throw new Error('공고를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('공고 상세 로드 오류:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 4. 💡 [NEW] 입양 신청 핸들러
    const handleApply = async () => {
        // 4-1. [보안] 로그인 확인
        if (!currentUser) {
            alert('입양 신청을 하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        // 4-2. 🚨 alert() 대신 커스텀 모달 권장
        // eslint-disable-next-line no-restricted-globals
        const isConfirmed = confirm(`정말로 '${post.name}'의 입양을 신청하시겠습니까? 신청 내역은 마이페이지에서 확인하실 수 있습니다.`);
        
        if (!isConfirmed) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                userId: currentUser.id,
                username: currentUser.username,
                postId: post.id,
                petName: post.name
            };

            const response = await fetch('http://localhost:3001/api/adoption/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert('입양 신청이 완료되었습니다! 마이페이지에서 내역을 확인하세요.');
                // 4-3. 신청 완료 후 상태 변경 (예: '신청완료'로 버튼 변경 - 여기서는 alert만)
                // (선택사항) navigate('/mypage'); 
            } else {
                // (예: 이미 신청한 경우 - 409 Conflict)
                setError(result.message || '입양 신청에 실패했습니다.');
            }
        } catch (err) {
            console.error('입양 신청 API 오류:', err);
            setError('서버 오류로 입양 신청에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. 💡 [NEW] 삭제 핸들러
    const handleDelete = async () => {
        // [보안] 본인 확인
        if (!currentUser || currentUser.id !== post.userId) {
            alert('공고를 삭제할 권한이 없습니다.');
            return;
        }

        // eslint-disable-next-line no-restricted-globals
        const isConfirmed = confirm('정말로 이 공고를 삭제하시겠습니까?');

        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/adoption/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                // [보안] 본인 인증을 위해 userId를 body에 담아 전송
                body: JSON.stringify({ userId: currentUser.id })
            });

            if (response.ok) {
                alert('입양 공고가 삭제되었습니다.');
                navigate('/adoption'); // 목록으로 이동
            } else {
                const errData = await response.json();
                alert(errData.message || '삭제에 실패했습니다.');
            }
        } catch (err) {
            console.error('삭제 API 오류:', err);
            alert('서버 오류로 삭제에 실패했습니다.');
        }
    };

    // 6. 💡 로딩 및 에러 UI
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">입양 공고를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error && !post) { // 7. 💡 post가 없을 때만 전체 화면 에러
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-10 bg-red-100 rounded-lg shadow-lg text-red-700">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-bold mb-2">오류 발생</p>
                    <p>😭 {error}</p>
                    <button 
                        onClick={() => navigate('/adoption')}
                        className="mt-4 px-4 py-2 bg-red-200 text-red-800 rounded-lg hover:bg-red-300 transition"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }
    
    if (!post) {
        return null;
    }

    // 8. 💡 본인 글인지 확인
    const isOwner = currentUser && post.userId === currentUser.id;

    // 아이콘 헬퍼
    const getSpeciesIcon = (species) => {
        if (species === '고양이') return <Cat className="w-4 h-4" />;
        if (species === '기타') return <Bird className="w-4 h-4" />;
        return <Dog className="w-4 h-4" />; // 기본값 '개'
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <button 
                        onClick={() => navigate('/adoption')} 
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        공고 목록으로
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                <article className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* 상단 헤더: 이미지 + 기본 정보 */}
                    <div className="md:flex">
                        {/* 이미지 */}
                        <div className="md:w-1/2">
                            <img
                                src={post.image || `https://placehold.co/600x600/cccccc/ffffff?text=${post.name}`}
                                alt={post.name}
                                className="w-full h-96 object-cover"
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = `https://placehold.co/600x600/cccccc/ffffff?text=${post.name}`;
                                }}
                            />
                        </div>
                        
                        {/* 기본 정보 */}
                        <div className="md:w-1/2 p-6 flex flex-col justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-3">{post.name}</h1>
                                <p className="text-lg text-gray-600 mb-4">{post.region}</p>
                                <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold text-white ${
                                    post.status === '입양가능' ? 'bg-green-500' : 'bg-gray-500'
                                }`}>
                                    {post.status || '입양가능'}
                                </div>
                                
                                <div className="mt-6 space-y-3">
                                    <InfoItem icon={getSpeciesIcon(post.species)} label="종류" value={post.species} />
                                    <InfoItem label="품종" value={post.breed} />
                                    <InfoItem label="나이" value={`${post.age}살`} />
                                    <InfoItem label="성별" value={post.gender} />
                                    <InfoItem label="크기" value={post.size} />
                                    <InfoItem icon={<User className="w-4 h-4"/>} label="공고작성자" value={post.author} />
                                    <InfoItem icon={<Calendar className="w-4 h-4"/>} label="공고일" value={new Date(post.createdAt).toLocaleDateString('ko-KR')} />
                                </div>
                            </div>
                            
                            {/* 9. 💡 [보안] 본인 글일 때만 '수정/삭제' 버튼 보이기 */}
                            {isOwner && (
                                <div className="flex gap-3 mt-6">
                                    <Link 
                                        to={`/adoption/edit/${post.id}`}
                                        className="flex-1 text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Edit className="w-4 h-4" />공고 수정
                                    </Link>
                                    <button 
                                        onClick={handleDelete} 
                                        className="flex-1 text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />공고 삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 하단 본문: 상세 설명 및 입양 신청 버튼 */}
                    <div className="p-6 border-t">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">상세 설명</h2>
                        <div className="prose max-w-none mb-8">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {post.description || "상세 설명이 없습니다."}
                            </p>
                        </div>

                        {/* 10. 💡 입양 신청 버튼 (본인 글이 아닐 때만 보임) */}
                        {!isOwner && (
                            <div className="text-center pt-6 border-t">
                                {/* 11. 💡 신청 실패 시 에러 메시지 표시 */}
                                {error && (
                                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm" role="alert">
                                        {error}
                                    </div>
                                )}
                                <button
                                    onClick={handleApply}
                                    disabled={isSubmitting || !currentUser}
                                    className="bg-blue-600 text-white px-10 py-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-3 w-full md:w-auto md:mx-auto text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            신청 처리 중...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            입양 신청하기
                                        </>
                                    )}
                                </button>
                                {!currentUser && (
                                    <p className="text-sm text-gray-500 mt-3">
                                        입양 신청을 하시려면 <Link to="/login" className="text-blue-600 hover:underline">로그인</Link>이 필요합니다.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </article>
            </main>
        </div>
    );
}

// 12. 💡 상세 정보 항목 컴포넌트
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center text-gray-700">
        <span className="font-semibold w-24 flex items-center gap-2 text-gray-500">
            {icon}
            {label}
        </span>
        <span className="font-medium text-gray-900">{value}</span>
    </div>
);