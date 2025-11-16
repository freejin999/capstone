import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
// 🌟 [수정] 몽글몽글한 폼 CSS 임포트 (Write와 Edit이 공유)
import './PetProductReviewWrite.css'; 

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function PetAdoptionEdit({ currentUser }) {
    const { id } = useParams(); // URL에서 공고 ID 가져오기
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
        status: '입양가능' // 3. 💡 상태(status) 필드 추가
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 폼 옵션
    const speciesOptions = ['개', '고양이', '기타'];
    const genderOptions = ['미상', '수컷', '암컷'];
    const sizeOptions = ['소형', '중형', '대형'];
    const statusOptions = ['입양가능', '상담중', '입양완료']; // 4. 💡 상태 옵션

    // 5. 💡 기존 공고 데이터 불러오기
    useEffect(() => {
        if (!currentUser) {
            alert('이 페이지에 접근하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        fetchAdoptionPost(id);
    }, [id, currentUser, navigate]);

    const fetchAdoptionPost = async (postId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/adoption/${postId}`);
            if (response.ok) {
                const data = await response.json();
                
                // 6. 💡 [보안 수정] 
                // data.author(username) 대신 data.userId(숫자ID)로 비교합니다.
                if (data.userId !== currentUser.id) { 
                    alert('이 공고를 수정할 권한이 없습니다.');
                    navigate(`/adoption/${id}`); // 상세 페이지로 튕기기
                    return;
                }
                
                // 7. 💡 폼 데이터 설정
                setFormData({
                    name: data.name,
                    species: data.species,
                    breed: data.breed,
                    age: data.age,
                    gender: data.gender,
                    size: data.size,
                    region: data.region,
                    description: data.description,
                    image: data.image || '',
                    status: data.status || '입양가능'
                });
            } else {
                throw new Error('공고를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('공고 조회 오류:', err);
            setError(err.message || '서버와의 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 8. 💡 수정 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 유효성 검사
        if (!formData.name.trim() || !formData.breed.trim() || !String(formData.age).trim() || !formData.region.trim() || !formData.description.trim()) {
            setError('필수 항목(*)을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        // API로 전송할 데이터 조립 (userId 포함)
        const payload = {
            ...formData,
            age: parseInt(formData.age) || 0, // 나이는 숫자로 변환
            userId: currentUser.id, // [보안] 본인 확인용
        };

        try {
            const response = await fetch(`http://localhost:3001/api/adoption/${id}`, {
                method: 'PUT', // 9. 💡 [수정] PUT 요청
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('공고가 성공적으로 수정되었습니다!');
                navigate(`/adoption/${id}`); // 수정된 상세 페이지로 이동
            } else {
                const errData = await response.json();
                setError(errData.message || '공고 수정에 실패했습니다.');
            }
        } catch (apiError) {
            console.error('공고 수정 오류:', apiError);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 11. 로딩 UI
    if (loading) {
        return (
            <div className="review-form-page-wrapper loading">
                <div className="spinner"></div>
                <p>공고 정보를 불러오는 중...</p>
            </div>
        );
    }
    
    // 에러 발생 시
    if (error) {
        return (
            <div className="review-form-page-wrapper loading">
                 <div className="error-box">
                    <AlertCircle className="icon-large" />
                    <p>😭 {error}</p>
                    <button
                        onClick={() => navigate('/adoption')} 
                        className="button primary-button"
                    >
                        목록으로
                    </button>
                </div>
            </div>
        );
    }


    return (
        // 🌟 [수정] CSS 클래스명 변경
        <div className="review-form-page-wrapper">
            {/* 🌟 [제거] <style> 블록 전체 삭제 */}
            
            {/* Header */}
            <header className="form-header">
                <div className="form-header-container">
                    <h1 className="form-title">입양 공고 수정</h1>
                    <button
                        onClick={() => navigate(`/adoption/${id}`)}
                        className="button-link"
                    >
                        <ArrowLeft className="icon-sm" />
                        수정 취소
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="form-main-container">
                <form onSubmit={handleSubmit} className="form-card">
                    
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="message-box error" role="alert">
                            {error}
                        </div>
                    )}

                    {/* 작성자 정보 (로그인 정보 표시) */}
                    <div className="form-group">
                        <label className="form-label">
                            공고 작성자
                        </label>
                        <div className="form-input" style={{ backgroundColor: '#f9f9f9', color: '#555' }}>
                            {currentUser ? (
                                <span>{currentUser.nickname || currentUser.username}</span>
                            ) : (
                                <span style={{color: '#c23939'}}>로그인 정보 없음</span>
                            )}
                        </div>
                    </div>

                    {/* 입양 상태 변경 */}
                    <div className="form-group">
                        <label className="form-label">입양 상태 <span className="required-star">*</span></label>
                        <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* 동물 이름 */}
                    <div className="form-group">
                        <label className="form-label">
                            동물 이름 <span className="required-star">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="예: 복돌이"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* 2x2 그리드: 종류, 품종 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {/* 종류 */}
                        <div className="form-group">
                            <label className="form-label">종류 <span className="required-star">*</span></label>
                            <select name="species" value={formData.species} onChange={handleChange} className="form-input">
                                {speciesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* 품종 */}
                        <div className="form-group">
                            <label className="form-label">품종 <span className="required-star">*</span></label>
                            <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="예: 믹스, 코숏, 푸들" className="form-input" required />
                        </div>
                    </div>

                    {/* 3x3 그리드: 나이, 성별, 크기 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {/* 나이 */}
                        <div className="form-group">
                            <label className="form-label">나이 (살) <span className="required-star">*</span></label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="숫자만 입력 (예: 3)" className="form-input" min="0" required />
                        </div>
                        {/* 성별 */}
                        <div className="form-group">
                            <label className="form-label">성별 <span className="required-star">*</span></label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                                {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* 크기 */}
                        <div className="form-group">
                            <label className="form-label">크기 <span className="required-star">*</span></label>
                            <select name="size" value={formData.size} onChange={handleChange} className="form-input">
                                {sizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 발견 지역 */}
                    <div className="form-group">
                        <label className="form-label">
                            발견/보호 지역 <span className="required-star">*</span>
                        </label>
                        <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="예: 서울시 강남구" className="form-input" required />
                    </div>

                    {/* 이미지 URL */}
                    <div className="form-group">
                        <label className="form-label">
                            사진 URL (선택)
                        </label>
                        <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.png" className="form-input" />
                    </div>

                    {/* 상세 설명 */}
                    <div className="form-group">
                        <label className="form-label">
                            상세 설명 <span className="required-star">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="동물의 성격, 건강 상태, 발견 당시 상황 등을 자세히 적어주세요."
                            rows={10}
                            className="form-input" // 🌟 [수정] textarea-field -> form-input
                            required
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="form-footer">
                        <button
                            type="button"
                            onClick={() => navigate(`/adoption/${id}`)}
                            className="button secondary-button"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentUser}
                            className="button primary-button"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner-sm"></div>
                                    수정 중...
                                </>
                            ) : (
                                <>
                                    <Save className="icon-sm" />
                                    수정 완료
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}