import React, { useState, useEffect, useRef } from 'react'; // 🌟 useRef 추가
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, AlertCircle } from 'lucide-react'; // 🌟 Upload, X, AlertCircle 아이콘 추가

// 1. App.js로부터 'currentUser'를 props로 받습니다.
export default function BoardEdit({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // 2. 폼 상태 관리
    const [formData, setFormData] = useState({
        title: '',
        category: '자유게시판',
        content: '',
        image: '', // 🌟 이미지 URL 필드 추가
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [originalAuthor, setOriginalAuthor] = useState(null); // 💡 원본 글 작성자 저장

    // 🌟 [추가] 파일 업로드 관련 상태
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('url'); // 수정은 URL로 시작
    const fileInputRef = useRef(null); // 파일 인풋 참조


    const categories = ['공지사항', '자유게시판', '질문게시판', '중고거래'];

    // 3. 기존 게시글 데이터 불러오기
    useEffect(() => {
        if (!currentUser) {
            alert('이 페이지에 접근하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        fetchPost();
    }, [id, currentUser, navigate]); 

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/posts/${id}`);
            
            if (response.ok) {
                const data = await response.json();
                
                // 4. [보안] 🌟 권한 검사 🌟
                if (data.author !== currentUser.username) {
                    alert('이 글을 수정할 권한이 없습니다.');
                    navigate(`/board/${id}`); // 상세 페이지로 돌려보내기
                    return;
                }

                setOriginalAuthor(data.author);

                // 5. 권한이 있으면 폼 데이터 설정
                setFormData({
                    title: data.title,
                    category: data.category,
                    content: data.content,
                    image: data.image || '', // 🌟 기존 이미지 URL 설정
                });

                // 이미지 미리보기 설정
                if (data.image) {
                    setImagePreview(data.image);
                    // URL이 이미 채워져 있으므로 URL 모드로 시작
                    setUploadMethod('url'); 
                } else {
                    setUploadMethod('file'); // 이미지가 없으면 파일 업로드 모드로 시작
                }

            } else {
                throw new Error('게시글을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('게시글 조회 오류:', error);
            setError('서버와의 연결에 실패했습니다.');
            navigate('/board');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // URL 입력 시 미리보기 업데이트 (URL 모드일 때만)
        if (name === 'image' && uploadMethod === 'url') {
            setImagePreview(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // 🌟 [추가] 파일 선택 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setFormData(prev => ({ ...prev, image: '' })); // URL 입력값 초기화
        }
    };

    // 🌟 [추가] 이미지 제거 핸들러
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: '' }));
        if (fileInputRef.current) {
             fileInputRef.current.value = ''; // 파일 인풋도 초기화
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 유효성 검사
        if (!formData.title.trim()) {
            setError('제목을 입력해주세요.');
            return;
        }
        if (!formData.content.trim()) {
            setError('내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        let finalImageUrl = formData.image;

        try {
            // 🌟 1. 파일 업로드 방식 + 새 파일 선택 시 (서버 업로드)
            if (uploadMethod === 'file' && imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);

                const uploadResponse = await fetch('http://localhost:3001/api/upload/image', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    finalImageUrl = uploadResult.imageUrl; // 서버에서 받은 URL 사용
                } else {
                    const uploadError = await uploadResponse.json();
                    throw new Error(uploadError.message || '이미지 업로드 실패');
                }
            } 
            // 🌟 2. 파일 모드인데 기존 이미지가 유지된 경우 (새 파일 X)
            else if (uploadMethod === 'file' && imagePreview) {
                finalImageUrl = imagePreview; 
            } 
            // 🌟 3. URL 모드일 경우 (formData.image가 최종 값)
            else if (uploadMethod === 'url') {
                finalImageUrl = formData.image; 
            }
            // 🌟 4. 이미지 삭제 시에는 finalImageUrl이 빈 문자열로 남아있음

            const payload = {
                title: formData.title,
                category: formData.category,
                content: formData.content,
                image: finalImageUrl, // 🌟 최종 이미지 URL 포함
            };

            const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // 7. payload 전송
            });

            if (response.ok) {
                alert('게시글이 수정되었습니다!');
                navigate(`/board/${id}`); // 수정된 상세 페이지로 이동
            } else {
                const errData = await response.json();
                setError(errData.message || '게시글 수정에 실패했습니다.');
            }
        } catch (submitError) {
            console.error('수정 요청 오류:', submitError);
            setError('서버 연결 또는 이미지 업로드에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="write-container loading-state">
                <style>{styles}</style>
                <div className="spinner-center"><div className="spinner-large"></div></div>
                <p className="loading-text">게시글을 불러오는 중...</p>
            </div>
        );
    }
    
    // 로딩은 끝났으나 원본 작성자가 없으면 렌더링을 막음 (권한 없음 상태)
    if (!originalAuthor) {
        return null;
    }


    return (
        <div className="write-container">
            {/* ------------------------------------------- */}
            {/* 🎨 CSS 스타일 정의 (단일 파일 내) */}
            {/* ------------------------------------------- */}
            <style>{styles}</style>

            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <h1 className="title">게시글 수정</h1>
                    <button
                        onClick={() => navigate(`/board/${id}`)}
                        className="back-button"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        취소
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <form onSubmit={handleSubmit} className="post-form">
                    
                    {/* 에러 메시지 표시 */}
                    {error && (
                        <div className="error-box" role="alert">
                            {error}
                        </div>
                    )}
                    
                    {/* 카테고리 선택 */}
                    <div className="form-group">
                        <label className="label-text">
                            카테고리 <span style={{color: 'red'}}>*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="select-field"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 작성자 정보 (로그인 정보 사용) */}
                    <div className="form-group">
                        <label className="label-text">
                            작성자
                        </label>
                        <div className="author-info-box">
                            <span className="author-name">{originalAuthor}</span>
                        </div>
                    </div>

                    {/* 제목 입력 */}
                    <div className="form-group">
                        <label className="label-text">
                            제목 <span style={{color: 'red'}}>*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="제목을 입력하세요"
                            className="input-field"
                            maxLength={100}
                        />
                        <p style={{fontSize: '12px', color: '#A0A0A0'}}>
                            {formData.title.length}/100
                        </p>
                    </div>

                    {/* 🌟 이미지 업로드 영역 */}
                    <div className="form-group">
                        <label className="label-text">사진 첨부 (선택)</label>
                        
                        <div className="upload-tabs">
                            <button
                                type="button"
                                className={`tab-button ${uploadMethod === 'file' ? 'active' : ''}`}
                                onClick={() => { 
                                    setUploadMethod('file'); 
                                    setFormData(prev => ({ ...prev, image: '' })); // URL 필드 초기화
                                }}
                            >
                                📁 파일 업로드
                            </button>
                            <button
                                type="button"
                                className={`tab-button ${uploadMethod === 'url' ? 'active' : ''}`}
                                onClick={() => {
                                    setUploadMethod('url');
                                    handleRemoveImage(); // 파일 입력 초기화
                                }}
                            >
                                🔗 URL 입력
                            </button>
                        </div>

                        {/* 🌟 파일 업로드 UI (파일 모드 + 이미지 없을 때만) */}
                        {uploadMethod === 'file' && !imagePreview && (
                             <label className={`file-upload-area`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden-file-input"
                                    ref={fileInputRef}
                                />
                                <div className="upload-placeholder">
                                    <Upload size={40} style={{color: '#735048'}} />
                                    <p>클릭하여 이미지를 선택하세요</p>
                                    <span style={{fontSize: '12px', color: '#999'}}>JPG, PNG (최대 5MB)</span>
                                </div>
                            </label>
                        )}
                        {/* 🌟 URL 입력 UI */}
                        {uploadMethod === 'url' && (
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.png 주소를 붙여넣으세요"
                                className="input-field"
                            />
                        )}
                        
                        {/* 🌟 파일/URL 미리보기 및 제거 버튼 (imagePreview가 있을 때만 표시) */}
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="미리보기" className="image-preview" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="remove-image-btn"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        
                    </div>


                    {/* 내용 입력 */}
                    <div className="form-group">
                        <label className="label-text">
                            내용 <span style={{color: 'red'}}>*</span>
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="내용을 입력하세요"
                            rows={15}
                            className="textarea-field"
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="button-group">
                        <button
                            type="button"
                            onClick={() => navigate(`/board/${id}`)}
                            className="cancel-button"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentUser} 
                            className="submit-button"
                        >
                            {isSubmitting ? (
                                <span className="spinner-center">
                                    <span className="spinner"></span>
                                    수정 중...
                                </span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
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

// 🌟 [수정] 원본 파란색 테마 CSS (변경 없음)
const styles = `
    /* 컬러 팔레트: #F2EDE4(배경), #594C3C(텍스트), #F2E2CE(경계선), #F2CBBD(악센트), #735048(기본 색상) */
    
    .write-container {
        min-height: 100vh;
        background-color: #F2EDE4; /* Light Background */
        font-family: 'Inter', sans-serif;
    }
    .header {
        background-color: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid #F2E2CE;
    }
    .header-content {
        max-width: 900px;
        margin: 0 auto;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .title {
        font-size: 24px;
        font-weight: bold;
        color: #735048; /* Primary Color */
    }
    .back-button {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #594C3C;
        text-decoration: none;
        transition: color 0.15s;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 8px 12px;
        border-radius: 8px;
    }
    .back-button:hover {
        color: #735048;
        background-color: #F2E2CE;
    }

    .main-content {
        max-width: 900px;
        margin: 32px auto;
        padding: 0 16px;
    }
    .post-form {
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        border: 1px solid #F2E2CE;
    }
    .error-box {
        background-color: #fcebeb; 
        border: 1px solid #f09b9b; 
        color: #c23939; 
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 12px;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .label-text {
        font-size: 14px;
        font-weight: 500;
        color: #594C3C;
    }
    .input-field, .textarea-field, .select-field {
        width: 100%;
        padding: 12px;
        border: 1px solid #F2CBBD; /* Accent Border */
        border-radius: 8px;
        font-size: 16px;
        box-sizing: border-box;
        color: #594C3C;
    }
    .input-field:focus, .textarea-field:focus, .select-field:focus {
        outline: none;
        border-color: #735048;
        box-shadow: 0 0 0 2px #F2E2CE;
    }
    .textarea-field {
        resize: vertical;
        min-height: 250px;
    }
    
    .author-info-box {
        padding: 12px;
        border: 1px solid #F2E2CE;
        border-radius: 8px;
        background-color: #F2EDE4; /* Light Accent Background */
        color: #594C3C;
        font-weight: 600;
    }
    .author-name { font-weight: 600; }

    /* 🌟 [NEW] 이미지 업로드 관련 스타일 */
    .upload-tabs {
        display: flex;
        gap: 8px;
    }
    .tab-button {
        flex: 1;
        padding: 10px;
        border: 1px solid #F2CBBD;
        background-color: white;
        color: #594C3C;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
    }
    .tab-button.active {
        background-color: #735048;
        color: white;
        border-color: #735048;
    }
    .tab-button:hover:not(.active) {
        background-color: #F2E2CE;
    }
    .file-upload-area {
        border: 2px dashed #F2CBBD;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        cursor: pointer;
        background-color: #fafafa;
        transition: all 0.15s;
    }
    .file-upload-area:hover {
        border-color: #735048;
        background-color: #F2E2CE;
    }
    .upload-placeholder { color: #594C3C; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .hidden-file-input { display: none; }
    .image-preview-container { position: relative; display: block; margin-top: 10px;}
    .image-preview { max-width: 100%; max-height: 300px; border-radius: 8px; border: 1px solid #ddd; display: block; margin: 0 auto; }
    .remove-image-btn {
        position: absolute; top: 10px; right: 10px;
        width: 32px; height: 32px; border-radius: 50%;
        background-color: #991b1b; color: white;
        border: 2px solid white; display: flex; align-items: center; justify-content: center;
        cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .button-group {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid #F2E2CE;
    }
    .cancel-button {
        padding: 10px 20px;
        border: 1px solid #735048;
        color: #735048;
        background-color: white;
        border-radius: 8px;
        transition: background-color 0.15s;
        cursor: pointer;
        font-weight: 600;
    }
    .cancel-button:hover:not(:disabled) {
        background-color: #F2E2CE;
    }
    .submit-button {
        padding: 10px 20px;
        background-color: #735048;
        color: white;
        border-radius: 8px;
        transition: background-color 0.15s;
        cursor: pointer;
        border: none;
        font-weight: 600;
        display: flex; align-items: center; gap: 8px;
    }
    .submit-button:hover:not(:disabled) {
        background-color: #594C3C;
    }
    .submit-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    /* 로딩 스피너 */
    .spinner-center { display: flex; align-items: center; justify-content: center; }
    .spinner {
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top: 3px solid #fff;
        border-radius: 50%;
        width: 16px; height: 16px;
        animation: spin 1s linear infinite;
    }
    .spinner-large {
        width: 40px;
        height: 40px;
        border-width: 4px;
        border-top-color: #735048;
        margin: 0 auto;
    }
    .loading-state {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #F2EDE4;
        color: #594C3C;
        text-align: center;
    }
    .loading-text {
        margin-top: 16px;
        font-weight: 500;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;