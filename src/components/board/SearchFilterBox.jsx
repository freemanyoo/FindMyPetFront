import React, { useState, useEffect } from 'react';
import './SearchFilterBox.css';

const SearchFilterBox = ({ onSearch, onFilterChange }) => {
    const [searchCriteria, setSearchCriteria] = useState({
        title: '',
        author: '',
        lostDateFrom: '',
        lostDateTo: '',
        location: '', // 👈 [수정] cityProvince와 district를 location 하나로 통합
        animalType: '',
        breed: '',
        gender: '',
        isFound: null
    });

    const [filterOptions, setFilterOptions] = useState({
        animalTypes: [],
        genders: [],
        breeds: []
        // 👈 [제거] cityProvinces, districts 제거
    });

    const [isExpanded, setIsExpanded] = useState(false);

    // useEffect(() => { loadFilterOptions(); }, []);
    //
    // // 👈 [제거] cityProvince에 따라 district를 로드하던 useEffect 제거

    useEffect(() => {
        if (searchCriteria.animalType) {
            loadBreeds(searchCriteria.animalType);
            setSearchCriteria(prev => ({ ...prev, breed: '' }));
        }
    }, [searchCriteria.animalType]);

    // const loadFilterOptions = async () => {
    //     try {
    //         const resp = await fetch('/api/find-pets/filter-options');
    //         if (!resp.ok) throw new Error('filter-options not available');
    //         const data = await resp.json();
    //         const animalCategories = data.animalCategories || data.animalTypes || [];
    //         const normalizedTypes = animalCategories.map((t) =>
    //             typeof t === 'string' ? { value: t, label: t } : t
    //         );
    //         setFilterOptions(prev => ({
    //             ...prev,
    //             animalTypes: normalizedTypes,
    //             genders: data.genders || [],
    //         }));
    //     } catch (e) {
    //         console.warn('필터 옵션 로드 실패(무시 가능):', e);
    //     }
    // };

    // 👈 [제거] loadDistricts 함수 제거

    const loadBreeds = async (animalType) => {
        try {
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
            location: '', // 👈 [수정] location으로 초기화
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
            {/* 상단 기본 검색창 및 버튼은 그대로 유지 */}
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
                    <button className="btn btn-filter" onClick={() => setIsExpanded(!isExpanded)}>
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
                    {/* 분실날짜 필터는 그대로 유지 */}
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>분실날짜</label>
                            <div className="date-range">
                                <input type="date" value={searchCriteria.lostDateFrom} onChange={(e) => handleInputChange('lostDateFrom', e.target.value)} className="date-input" />
                                <span className="date-separator">~</span>
                                <input type="date" value={searchCriteria.lostDateTo} onChange={(e) => handleInputChange('lostDateTo', e.target.value)} className="date-input" />
                            </div>
                        </div>
                    </div>

                    {/* 👇 [수정] 시도/시군구 드롭다운을 하나의 키워드 검색창으로 변경 */}
                    <div className="filter-row">
                        <div className="filter-group" style={{ flexGrow: 1 }}>
                            <label>분실지역 검색</label>
                            <input
                                type="text"
                                placeholder="지역 키워드 입력 (예: 부산진구)"
                                value={searchCriteria.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* 축종/품종/성별 필터는 그대로 유지 */}
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>축종</label>
                            <select value={searchCriteria.animalType} onChange={(e) => handleInputChange('animalType', e.target.value)} className="select-input">
                                <option value="">전체</option>
                                {filterOptions.animalTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>품종</label>
                            <select value={searchCriteria.breed} onChange={(e) => handleInputChange('breed', e.target.value)} className="select-input" disabled={!searchCriteria.animalType}>
                                <option value="">전체</option>
                                {filterOptions.breeds.map((breed) => <option key={breed} value={breed}>{breed}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>성별</label>
                            <select value={searchCriteria.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className="select-input">
                                <option value="">전체</option>
                                {filterOptions.genders.map((gender) => <option key={gender.value} value={gender.value}>{gender.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 상태 토글은 그대로 유지 */}
                    <div className="filter-row">
                        <div className="status-toggle-group">
                            <label>상태</label>
                            <div className="toggle-buttons">
                                <button className={`toggle-btn ${searchCriteria.isFound === null ? 'active' : ''}`} onClick={() => toggleFoundStatus(null)}>전체</button>
                                <button className={`toggle-btn ${searchCriteria.isFound === false ? 'active' : ''}`} onClick={() => toggleFoundStatus(false)}>찾는중</button>
                                <button className={`toggle-btn ${searchCriteria.isFound === true ? 'active' : ''}`} onClick={() => toggleFoundStatus(true)}>찾기완료</button>
                            </div>
                        </div>
                    </div>

                    {/* 초기화 버튼은 그대로 유지 */}
                    <div className="filter-actions">
                        <button className="btn btn-reset" onClick={handleReset}>초기화</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilterBox;
