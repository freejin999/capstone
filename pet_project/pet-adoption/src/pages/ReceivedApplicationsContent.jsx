import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Heart } from 'lucide-react';

// 입양공고 작성자가 받은 신청 목록을 보는 컴포넌트
const ReceivedApplicationsContent = ({ currentUser }) => {
    const navigate = useNavigate();
    const [receivedApps, setReceivedApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchReceivedApplications = async () => {
            setLoading(true);
            setError(null);
            try {
                // 내가 작성한 입양공고에 대한 신청 목록 조회
                const response = await fetch(`http://localhost:3001/api/adoption/received/${currentUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setReceivedApps(data);
                } else {
                    setError('신청 목록을 불러오는 데 실패했습니다.');
                }
            } catch (err) {
                console.error('받은 신청 조회 오류:', err);
                setError('서버 연결에 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchReceivedApplications();
    }, [currentUser?.id]);

    // 신청 상태 변경 (승인/거절)
    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:3001/api/adoption/application/${applicationId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, userId: currentUser.id })
            });

            if (response.ok) {
                alert(`신청이 ${newStatus === '승인 완료' ? '승인' : '거절'}되었습니다.`);
                // 목록 새로고침
                setReceivedApps(prevApps => 
                    prevApps.map(app => 
                        app.id === applicationId ? { ...app, status: newStatus } : app
                    )
                );
            } else {
                const errData = await response.json();
                alert(errData.message || '상태 변경에 실패했습니다.');
            }
        } catch (err) {
            console.error('상태 변경 오류:', err);
            alert('서버 오류가 발생했습니다.');
        }
    };

    return (
        <div className="profile-card">
            <h2 className="card-header">
                <Heart className="icon-main icon-amber"/> 받은 입양 신청
            </h2>
            
            {loading ? (
                <p className="card-placeholder">신청 목록을 불러오는 중...</p>
            ) : error ? (
                <p className="card-placeholder error">{error}</p>
            ) : receivedApps.length === 0 ? (
                <p className="card-placeholder">받은 입양 신청이 없습니다.</p>
            ) : (
                <div className="application-list">
                    {receivedApps.map(app => (
                        <div key={app.id} className="application-card received-app-card">
                            <div className="received-app-info">
                                <div className="received-app-header">
                                    <p className="application-pet-name">{app.petName}</p>
                                    <span className={`status-badge ${
                                        app.status === '심사 중' || app.status === '신청완료' ? 'status-pending' :
                                        app.status === '승인 완료' ? 'status-success' :
                                        'status-danger'
                                    }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="application-meta">
                                    <span className="meta-item">
                                        <User className="icon-xs"/> 신청자: {app.applicantNickname || app.username}
                                    </span>
                                    <span className="meta-item">
                                        <Calendar className="icon-xs"/> 신청일: {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>
                                
                                {/* 신청 상태가 '심사 중'이거나 '신청완료'일 때만 승인/거절 버튼 표시 */}
                                {(app.status === '심사 중' || app.status === '신청완료') && (
                                    <div className="received-app-actions">
                                        <button 
                                            onClick={() => handleStatusChange(app.id, '승인 완료')}
                                            className="button primary small-button"
                                        >
                                            승인
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(app.id, '거절')}
                                            className="button danger small-button"
                                        >
                                            거절
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate(`/adoption/${app.postId}`)}
                                className="button secondary-light small-button"
                            >
                                공고 보기
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <style>{`
                .received-app-card {
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.5rem;
                }
                
                .received-app-info {
                    flex: 1;
                }
                
                .received-app-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }
                
                .received-app-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                
                .small-button {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                }
                
                @media (max-width: 640px) {
                    .received-app-card {
                        flex-direction: column;
                    }
                    
                    .received-app-actions {
                        flex-direction: column;
                    }
                    
                    .small-button {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReceivedApplicationsContent;