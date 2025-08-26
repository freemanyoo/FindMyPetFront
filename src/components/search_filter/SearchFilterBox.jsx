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
        animalTypes: [],
        genders: [],
        cityProvinces: [],
        districts: [],
        breeds: []
    });

    const [isExpanded, setIsExpanded] = useState(false);

    // 필터 옵션 로드
    useEffect(() => {
        loadFilterOptions();
    }, []);

    // 시도 변경 시 군구 목록 업데이트
    useEffect(() => {
        if (searchCriteria.cityProvince) {
            loadDistricts(searchCriteria.cityProvince);
            setSearchCriteria(prev => ({ ...prev, district: '' }));
        }
    }, [searchCriteria.cityProvince]);

    // 동물 타입 변경 시 품종 목록 업데이트
    useEffect(() => {
        if (searchCriteria.animalType) {
            loadBreeds(searchCriteria.animalType);
            setSearchCriteria(prev => ({ ...prev, breed: '' }));
        }
    }, [searchCriteria.animalType]);

    const loadFilterOptions = async () => {
        try {
            const response = await fetch('/api/find-pets/filter-options');
            const data = await response.json();
            setFilterOptions(prev => ({
                ...prev,
                animalTypes: data.animalTypes || [],
                genders: data.genders || [],
                cityProvinces: data.cityProvinces || []
            }));
        } catch (error) {
            console.error('필터 옵션 로드 실패:', error);
        }
    };

    const loadDistricts = async (cityProvince) => {
        try {
            const response = await fetch(`/api/find-pets/districts?cityProvince=${encodeURIComponent(cityProvince)}`);
            const data = await response.json();
            setFilterOptions(prev => ({ ...prev, districts: data || [] }));
        } catch (error) {
            console.error('군구 목록 로드 실패:', error);
        }
    };

    const loadBreeds = async (animalType) => {
        try {
            const response = await fetch(`/api/find-pets/breeds?animalType=${animalType}`);
            const data = await response.json();
            setFilterOptions(prev => ({ ...prev, breeds: data || [] }));
        } catch (error) {
            console.error('품종 목록 로드 실패:', error);
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
                                {filterOptions.cityProvinces.map(city => (
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
                                {filterOptions.districts.map(district => (
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
                                {filterOptions.animalTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
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
                                {filterOptions.breeds.map(breed => (
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
                                {filterOptions.genders.map(gender => (
                                    <option key={gender.value} value={gender.value}>{gender.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="status-toggle-group">
                            <label>검색 상태</label>
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
                                    검색중
                                </button>
                                <button
                                    className={`toggle-btn ${searchCriteria.isFound === true ? 'active' : ''}`}
                                    onClick={() => toggleFoundStatus(true)}
                                >
                                    검색완료
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