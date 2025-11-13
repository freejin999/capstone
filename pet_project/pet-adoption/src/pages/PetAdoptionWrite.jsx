import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetAdoptionWrite({ currentUser }) {
    const navigate = useNavigate();
    
    // 2. 폼 데이터 상태 (공고글에 필요한 필드)
    const [formData, setFormData] = useState({
        name: '', // 동물 이름
        species: '개', // 종 (개, 고양이, 기타)
        breed: '', // 품종
        age: '', // 나이 (숫자)
        gender: '미상', // 성별
        size: '소형', // 크기
        region: '', // 발견 지역
        description: '', // 상세 설명
        image: '', // 이미지 URL
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const speciesOptions = ['개', '고양이', '기타'];
    const genderOptions = ['미상', '수컷', '암컷'];
    const sizeOptions = ['소형', '중형', '대형'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // [보안] currentUser 확인
        if (!currentUser) {
            alert('공고를 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        // 유효성 검사
        if (!formData.name.trim() || !formData.breed.trim() || !formData.age.trim() || !formData.region.trim() || !formData.description.trim()) {
            setError('필수 항목(*)을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        // API로 전송할 데이터 조립 (currentUser 정보 포함)
        const payload = {
            ...formData,
            age: parseInt(formData.age) || 0, // 나이는 숫자로 변환
            userId: currentUser.id,
            author: currentUser.username, // 공고 작성자 (고유 ID)
            authorNickname: currentUser.nickname // 🌟 [수정] 작성자 닉네임 추가
        };

        try {
            const response = await fetch('http://localhost:3001/api/adoption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('입양 공고가 성공적으로 등록되었습니다!');
                navigate('/adoption'); // 공고 목록 페이지로 이동
            } else {
                const errData = await response.json();
                setError(errData.message || '공고 등록에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('공고 작성 오류:', apiError);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-blue-600">새 입양 공고 작성</h1>
                        <button
                            onClick={() => navigate('/adoption')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            목록으로
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* 동물 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="예: 복돌이"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 2x2 그리드: 종류, 품종 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 종류 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">종류 <span className="text-red-500">*</span></label>
                            <select name="species" value={formData.species} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {speciesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* 품종 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">품종 <span className="text-red-500">*</span></label>
                            <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="예: 믹스, 코숏, 푸들" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    {/* 3x3 그리드: 나이, 성별, 크기 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 나이 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">나이 (살) <span className="text-red-500">*</span></label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="숫자만 입력 (예: 3)" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {/* 성별 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">성별 <span className="text-red-500">*</span></label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* 크기 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">크기 <span className="text-red-500">*</span></label>
                            <select name="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {sizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 발견 지역 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            발견/보호 지역 <span className="text-red-500">*</span>
                        </label>
                        <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="예: 서울시 강남구" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* 이미지 URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            사진 URL (선택)
                        </label>
                        <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.png" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* 상세 설명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            상세 설명 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description" // 🌟 [핵심 수정] "content" -> "description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="동물의 성격, 건강 상태, 발견 당시 상황 등을 자세히 적어주세요."
                            rows={10}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/adoption')}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentUser}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    등록 중...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    공고 등록
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}