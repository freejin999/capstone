import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, Filter, X, RefreshCw } from 'lucide-react';

// Card 컴포넌트 분리 (재사용성을 위해)
const PetCard = ({ pet }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition duration-300 cursor-pointer">
        {/* 이미지 영역 */}
        <img
            src={pet.image}
            alt={pet.name}
            className="w-full h-56 object-cover"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/400x400/cccccc/ffffff?text=${pet.name}`;
            }}
        />
        <div className="p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                <span className="text-sm text-gray-500">{pet.age}세</span>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
                {pet.breed} · {pet.gender}아 · {pet.size}
            </p>
            <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-1 text-red-500" />
                {pet.region}
            </div>
            <button className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold">
                자세히 보기
            </button>
        </div>
    </div>
);


export default function PetAdoptionSite() {
    const [adoptionPets, setAdoptionPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        species: 'all',
        gender: 'all',
        size: 'all',
        age: 'all',
    });

    // 💡 Node.js 백엔드 서버에서 데이터를 가져오는 함수
    const fetchPets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 팀원 A가 만든 API 엔드포인트
            const response = await fetch('http://localhost:3001/api/adoption'); 

            if (!response.ok) {
                // HTTP 오류 응답 처리
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAdoptionPets(data);

        } catch (err) {
            console.error("데이터를 가져오는 중 오류 발생:", err);
            setError("😭 서버에서 입양 공고 데이터를 가져오지 못했습니다. (Node.js 서버 실행 확인 필요)");
        } finally {
            setLoading(false);
        }
    }, []);

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchPets();
    }, [fetchPets]);

    // ----------------------------------------------------
    // 필터링 및 검색 로직
    // ----------------------------------------------------
    const filteredAndSearchedPets = adoptionPets.filter(pet => {
        // 1. 검색어 필터
        const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              pet.region.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // 2. 카테고리 필터 (species, gender, size)
        if (filters.species !== 'all' && pet.species !== filters.species) return false;
        if (filters.gender !== 'all' && pet.gender !== filters.gender) return false;
        if (filters.size !== 'all' && pet.size !== filters.size) return false;
        
        // 3. 나이 필터 (간단화)
        if (filters.age !== 'all') {
            const ageNum = parseInt(pet.age);
            if (filters.age === 'young' && ageNum > 2) return false;
            if (filters.age === 'adult' && (ageNum <= 2 || ageNum >= 7)) return false;
            if (filters.age === 'senior' && ageNum < 7) return false;
        }

        return true;
    });

    // 필터 초기화 함수
    const resetFilters = () => {
        setFilters({species: 'all', gender: 'all', size: 'all', age: 'all'});
        setSearchTerm('');
    };

    // ----------------------------------------------------
    // JSX 렌더링
    // ----------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6 text-orange-600 border-b pb-2">
                    유기동물 입양 공고 목록
                </h1>

                {/* 검색 및 필터 버튼 */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
                    {/* 검색창 */}
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="이름, 품종, 지역으로 검색하세요"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    
                    {/* 필터 열기/닫기 버튼 */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full md:w-auto flex items-center gap-2 px-4 py-2 border rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition font-semibold"
                        >
                            <Filter className="w-5 h-5" />
                            필터 {showFilters ? '숨기기' : '열기'}
                        </button>
                        <button
                            onClick={fetchPets}
                            className="w-full md:w-auto flex items-center gap-2 px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? '로딩 중' : '새로고침'}
                        </button>
                    </div>
                </div>

                {/* 필터 패널 */}
                {showFilters && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-orange-200">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {/* 동물 종류 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">종류</label>
                                <select
                                    value={filters.species}
                                    onChange={(e) => setFilters({...filters, species: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="all">전체</option>
                                    <option value="개">강아지</option>
                                    <option value="고양이">고양이</option>
                                </select>
                            </div>
                            {/* 성별 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                                <select
                                    value={filters.gender}
                                    onChange={(e) => setFilters({...filters, gender: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="all">전체</option>
                                    <option value="남">남아</option>
                                    <option value="여">여아</option>
                                </select>
                            </div>
                            {/* 크기 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">크기</label>
                                <select
                                    value={filters.size}
                                    onChange={(e) => setFilters({...filters, size: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="all">전체</option>
                                    <option value="소형">소형</option>
                                    <option value="중형">중형</option>
                                    <option value="대형">대형</option>
                                </select>
                            </div>
                            {/* 나이 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">나이대</label>
                                <select
                                    value={filters.age}
                                    onChange={(e) => setFilters({...filters, age: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="all">전체</option>
                                    <option value="young">어린이 (0-2세)</option>
                                    <option value="adult">성년 (3-6세)</option>
                                    <option value="senior">노령 (7세 이상)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                             <button
                                onClick={resetFilters}
                                className="flex items-center gap-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
                            >
                                <X className="w-4 h-4" /> 필터 초기화
                            </button>
                        </div>
                    </div>
                )}
                
                {/* ----------------------------------------------------
                    데이터 표시 영역
                ---------------------------------------------------- */}
                {loading && (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
                        <p>입양 공고 데이터를 불러오는 중입니다...</p>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">통신 오류!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                        <p className="mt-2 text-sm">Node.js 서버(터미널 1)가 **`node index.js`** 명령어로 실행 중인지 확인하고, **CORS** 설정이 되어 있는지 확인해 주세요.</p>
                        <button onClick={fetchPets} className="mt-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">다시 시도</button>
                    </div>
                )}

                {!loading && !error && (
                    filteredAndSearchedPets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAndSearchedPets.map(pet => (
                                <PetCard key={pet.id} pet={pet} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-lg mt-8">
                            <p>🔎 검색 및 필터 조건에 맞는 입양 공고가 없습니다.</p>
                            <button onClick={resetFilters} className="mt-4 text-orange-500 hover:underline">필터 초기화</button>
                        </div>
                    )
                )}

            </div>
        </div>
    );
}
