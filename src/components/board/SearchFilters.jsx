/*
  [팀원 공유용] 기존 SearchFilters 컴포넌트 (주석 처리)

  이 파일은 초기에 기획서 MVP(최소 기능 제품)와 백엔드 API 명세서에 따라
  간단하게 구현되었던 검색 필터 컴포넌트입니다.

  현재는 더 상세한 기능을 가진 SearchFilterBox.jsx (2SearchFilters)를
  사용하기로 결정하여 이 파일의 내용은 주석 처리합니다.

  =============================================================
  == 두 필터 컴포넌트 비교 분석 (Gemini AI 요약) ==
  =============================================================

  | 항목 | 1SearchFilters (이 파일) | 2SearchFilters (현재 사용) |
  | :--- | :--- | :--- |
  | 백엔드 API | /api/categories, /api/regions | /api/find-pets/** (별도 API) |
  | 기능 범위 | MVP (키워드, 종류, 지역) | 상세 검색 (날짜, 작성자, 상태 등) |
  | 장점 | - 현재 백엔드 API와 100% 호환 | - UX가 우수하고 기능이 풍부함 |
  |      | - 코드가 단순하고 직관적 | - 상세 검색 요구사항에 부합 |
  | 단점 | - 기능이 너무 단순함 | - 백엔드에 별도 API 구현 필요 |

  [결론 및 협업 요청]
  SearchFilterBox.jsx의 상세 기능이 우리 프로젝트에 더 적합하다고 판단됩니다.
  다만, 해당 컴포넌트가 사용하는 API(/api/find-pets/...)가 현재 백엔드 명세서에 없으므로,
  백엔드 담당자와 협의하여 필요한 API를 추가 개발해야 합니다.
*/

/*
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const SearchFilters = ({ onFilterChange }) => {
    const [categories, setCategories] = useState([]);
    const [regions, setRegions] = useState([]);
    const [filters, setFilters] = useState({
        keyword: '',
        category: '',
        region: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoryRes, regionRes] = await Promise.all([
                    axiosInstance.get('/categories'),
                    axiosInstance.get('/regions'),
                ]);
                setCategories(categoryRes.data.data.categories);
                setRegions(regionRes.data.data.regions);
            } catch (error) {
                console.error("필터 데이터 로딩 실패:", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        onFilterChange(filters);
    };

    return (
        <div className="search-filters">
            <input
                type="text"
                name="keyword"
                className="search-input"
                placeholder="검색어를 입력하세요"
                value={filters.keyword}
                onChange={handleChange}
            />
            <select name="category" className="filter-select" value={filters.category} onChange={handleChange}>
                <option value="">전체 동물</option>
                {categories.map(cat => (
                    <option key={cat.category} value={cat.category}>{cat.category}</option>
                ))}
            </select>
            <select name="region" className="filter-select" value={filters.region} onChange={handleChange}>
                <option value="">전체 지역</option>
                {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                ))}
            </select>
            <button className="btn btn-primary" onClick={handleSearch}>검색</button>
        </div>
    );
};

export default SearchFilters;
*/