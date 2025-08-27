import React, { useState, useEffect } from 'react';
import './SearchFilterBox.css';

const SearchFilterBox = ({ onSearch, onFilterChange }) => {
    const [searchCriteria, setSearchCriteria] = useState({
        title: '',
        author: '',
        lostDateFrom: '',
        lostDateTo: '',
        cityProvince: '',
        district: '',
        animalType: '',
        breed: '',
        gender: '',
        isFound: null
    });

    const [filterOptions, setFilterOptions] = useState({
        // 기존 UI 유지: 필드 이름 그대로 두되, 백엔드 응답을 유연하게 매핑
        animalTypes: [],     // = animalCategories
        genders: [],         // (없는 경우 빈 배열)
        cityProvinces: [],   // (없는 경우 빈 배열)
        districts: [],       // (없는 경우 빈 배열)
        breeds: []
    });

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => { loadFilterOptions(); }, []);
    useEffect(() => {
        if (searchCriteria.cityProvince) {
            // 백엔드에 도시/군구 API가 없을 수 있으므로 실패해도 무시
            loadDistricts(searchCriteria.cityProvince);
            setSearchCriteria(prev => ({ ...prev, district: '' }));
        }
    }, [searchCriteria.cityProvince]);

    useEffect(() => {
        if (searchCriteria.animalType) {
            loadBreeds(searchCriteria.animalType);
            setSearchCriteria(prev => ({ ...prev, breed: '' }));
        }
    }, [searchCriteria.animalType]);

    const loadFilterOptions = async () => {
        try {
            // 기존 엔드포인트 유지 시도
            const resp = await fetch('/api/find-pets/filter-options');
            if (!resp.ok) throw new Error('filter-options not available');
            const data = await resp.json();

            // 여러 형태를 유연하게 수용
            const animalCategories =
                data.animalCategories ||
                data.animalTypes ||
                []; // 문자열 배열 또는 {value,label} 배열 모두 허용

            const normalizedTypes = animalCategories.map((t) =>
                typeof t === 'string' ? { value: t, label: t } : t
            );

            setFilterOptions(prev => ({
                ...prev,
                animalTypes: normalizedTypes,
                genders: data.genders || [],
                cityProvinces: data.cityProvinces || [] // 없으면 빈 배열
            }));
        } catch (e) {
            console.warn('필터 옵션 로드 실패(무시 가능):', e);
            // 실패해도 UI 사용에는 지장 없도록 기본값 유지
        }
    };

    const loadDistricts = async (cityProvince) => {
        try {
            const resp = await fetch(`/api/find-pets/districts?cityProvince=${encodeURIComponent(cityProvince)}`);
            if (!resp.ok) throw new Error('districts not available');
            const data = await resp.json();
            setFilterOptions(prev => ({ ...prev, districts: data || [] }));
        } catch (e) {
            // 없으면 무시
            setFilterOptions(prev => ({ ...prev, districts: [] }));
        }
    };

    const loadBreeds = async (animalType) => {
        try {
            // animalType -> animalCategory 로 전달
            const resp = await fetch(`/api/find-pets/breeds?animalCategory=${encodeURIComponent(animalType)}`);
            if (!resp.ok) throw new Error('breeds not available');
            const data = await resp.json();
            setFilterOptions(prev => ({ ...prev, breeds: data || [] }));
        } catch (e) {
            console.warn('품종 목록 로드 실패(무시 가능):', e);
            setFilterOptions(prev => ({ ...prev, breeds: [] }));
        }
    };

    const handleInputChange = (field, value) => {
        const newCriteria = { ...searchCriteria, [field]: value };
        setSearchCriteria(newCriteria);
        onFilterChange && onFilterChange(newCriteria);
    };

    const handleSearch = () => {
        onSearch && onSearch(searchCriteria);
    };

    const handleReset = () => {
        const resetCriteria = {
            title: '',
            author: '',
            lostDateFrom: '',
            lostDateTo: '',
            cityProvince: '',
            district: '',
            animalType: '',
            breed: '',
            gender: '',
            isFound: null
        };
        setSearchCriteria(resetCriteria);
        onFilterChange && onFilterChange(resetCriteria);
        onSearch && onSearch(resetCriteria);
    };

    const toggleFoundStatus = (status) => {
        const newStatus = searchCriteria.isFound === status ? null : status;
        handleInputChange('isFound', newStatus);
    };

    return (
        <div className="search-filter-container">
            <div className="search-main-row">
                <div className="search-input-group">
                    <input
                        type="text"
                        placeholder="제목으로 검색..."
                        value={searchCriteria.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="search-input"
                    />
                    <input
                        type="text"
                        placeholder="작성자로 검색..."
                        value={searchCriteria.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="search-buttons">
                    <button
                        className="btn btn-filter"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <span className="filter-icon">⚙</span>
                        필터 {isExpanded ? '접기' : '펼치기'}
                    </button>
                    <button className="btn btn-search" onClick={handleSearch}>
                        <span className="search-icon">🔍</span>
                        검색
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="filter-expanded-section">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>분실날짜</label>
                            <div className="date-range">
                                <input
                                    type="date"
                                    value={searchCriteria.lostDateFrom}
                                    onChange={(e) => handleInputChange('lostDateFrom', e.target.value)}
                                    className="date-input"
                                />
                                <span className="date-separator">~</span>
                                <input
                                    type="date"
                                    value={searchCriteria.lostDateTo}
                                    onChange={(e) => handleInputChange('lostDateTo', e.target.value)}
                                    className="date-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label>시도</label>
                            <select
                                value={searchCriteria.cityProvince}
                                onChange={(e) => handleInputChange('cityProvince', e.target.value)}
                                className="select-input"
                            >
                                <option value="">전체</option>
                                {filterOptions.cityProvinces.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>시군구</label>
                            <select
                                value={searchCriteria.district}
                                onChange={(e) => handleInputChange('district', e.target.value)}
                                className="select-input"
                                disabled={!searchCriteria.cityProvince}
                            >
                                <option value="">전체</option>
                                {filterOptions.districts.map((district) => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label>축종</label>
                            <select
                                value={searchCriteria.animalType}
                                onChange={(e) => handleInputChange('animalType', e.target.value)}
                                className="select-input"
                            >
                                <option value="">전체</option>
                                {filterOptions.animalTypes.map((type) =>
                                    typeof type === 'string' ? (
                                        <option key={type} value={type}>{type}</option>
                                    ) : (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>품종</label>
                            <select
                                value={searchCriteria.breed}
                                onChange={(e) => handleInputChange('breed', e.target.value)}
                                className="select-input"
                                disabled={!searchCriteria.animalType}
                            >
                                <option value="">전체</option>
                                {filterOptions.breeds.map((breed) => (
                                    <option key={breed} value={breed}>{breed}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>성별</label>
                            <select
                                value={searchCriteria.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="select-input"
                            >
                                <option value="">전체</option>
                                {filterOptions.genders.map((gender) =>
                                    typeof gender === 'string' ? (
                                        <option key={gender} value={gender}>{gender}</option>
                                    ) : (
                                        <option key={gender.value} value={gender.value}>{gender.label}</option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="status-toggle-group">
                            <label>상태</label>
                            <div className="toggle-buttons">
                                <button
                                    className={`toggle-btn ${searchCriteria.isFound === null ? 'active' : ''}`}
                                    onClick={() => toggleFoundStatus(null)}
                                >
                                    전체
                                </button>
                                <button
                                    className={`toggle-btn ${searchCriteria.isFound === false ? 'active' : ''}`}
                                    onClick={() => toggleFoundStatus(false)}
                                >
                                    찾는중
                                </button>
                                <button
                                    className={`toggle-btn ${searchCriteria.isFound === true ? 'active' : ''}`}
                                    onClick={() => toggleFoundStatus(true)}
                                >
                                    찾기완료
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button className="btn btn-reset" onClick={handleReset}>
                            초기화
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilterBox;
