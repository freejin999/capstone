import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, Phone } from 'lucide-react';

export default function PetDetail() {
    const { id } = useParams(); // URL에서 동물 ID 추출
    const navigate = useNavigate();

    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔥 서버에서 동물 상세 정보 가져오기
    useEffect(() => {
        fetchPetDetail();
    }, [id]);

    const fetchPetDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // 💡 입양 공고 상세 API 호출
            const response = await fetch(`http://localhost:3001/api/adoption/${id}`);

            if (response.ok) {
                const data = await response.json();
                setPet(data);
            } else if (response.status === 404) {
                setError('해당 동물을 찾을 수 없습니다.');
            } else {
                setError('동물 정보를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('API 요청 오류:', error);
            setError('서버와의 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 로딩 중
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">동물 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 발생
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white shadow-lg rounded-lg">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/adoption')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 데이터 없음 (API는 성공했지만 pet이 null일 경우)
    if (!pet) {
        return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white shadow-lg rounded-lg">
                    <p className="text-gray-600 text-lg mb-4">동물 정보를 찾을 수 없습니다.</p>
                    <button
                        onClick={() => navigate('/adoption')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 성공적으로 데이터 로드
    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={() => navigate('/adoption')}
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-600 mb-6 font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    목록으로 돌아가기
                </button>

                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="md:flex">
                        {/* 동물 이미지 */}
                        <div className="md:flex-shrink-0">
                            <img 
                                src={pet.image} 
                                alt={pet.name} 
                                className="h-64 w-full object-cover md:w-64 md:h-full" 
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x400/cccccc/ffffff?text=No+Image"; }}
                            />
                        </div>
                        
                        {/* 동물 정보 */}
                        <div className="p-8 flex-grow">
                            <div className="uppercase tracking-wide text-sm text-orange-500 font-semibold mb-1">
                                {pet.species} - {pet.breed}
                            </div>
                            <h1 className="block mt-1 text-3xl leading-tight font-bold text-black mb-4">
                                {pet.name} <span className="text-xl font-medium text-gray-500">({pet.gender}아, {pet.age}살)</span>
                            </h1>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-gray-700 mb-6 border-t pt-4">
                                <div><span className="font-semibold">크기:</span> {pet.size}</div>
                                <div><span className="font-semibold">지역:</span> {pet.region}</div>
                                {/* DB 연동 시 추가될 수 있는 정보 */}
                                {/* <div><span className="font-semibold">중성화:</span> {pet.neutered ? '완료' : '미완료'}</div> */}
                                {/* <div><span className="font-semibold">접종:</span> {pet.vaccinated ? '완료' : '미완료'}</div> */}
                            </div>

                            <p className="mt-2 text-gray-600 leading-relaxed mb-6">
                                {pet.description || "상세 설명이 준비 중입니다."}
                            </p>

                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold text-lg flex items-center justify-center gap-2">
                                    <Heart className="w-5 h-5" fill="white" /> 입양 신청하기
                                </button>
                                <button className="flex-1 border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-lg hover:bg-orange-50 transition font-semibold flex items-center justify-center gap-2">
                                    <Phone className="w-5 h-5" /> 문의하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

