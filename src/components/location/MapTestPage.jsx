// src/pages/MapTestPage.jsx

import React, {useState} from 'react';
import LocationBoard from './LocationBoard.jsx';
import LocationPostForm from './LocationPostForm';

const MapTestPage = () => {
    // 게시판을 보여줄지, 등록 폼을 보여줄지 결정하는 상태
    const [isFormVisible, setIsFormVisible] = useState(false);

    // 폼 제출 성공 후, 게시판을 강제로 새로고침하기 위한 상태
    const [refreshKey, setRefreshKey] = useState(0);

    // LocationBoard에서 '위치 등록' 버튼을 눌렀을 때 호출될 함수
    const handleShowForm = () => {
        setIsFormVisible(true);
    };

    // LocationPostForm에서 '취소' 버튼을 눌렀을 때 호출될 함수
    const handleCancelForm = () => {
        setIsFormVisible(false);
    };

    // LocationPostForm에서 제출에 '성공'했을 때 호출될 함수
    const handleSubmitSuccess = () => {
        setIsFormVisible(false); // 폼 숨기기
        setRefreshKey(prevKey => prevKey + 1); // 게시판 새로고침 트리거
    };

    return (
        <div style={{padding: '2rem'}}>
            {isFormVisible ? (
                // isFormVisible이 true이면, 등록 폼을 렌더링
                <LocationPostForm
                    onCancel={handleCancelForm}
                    onSubmitSuccess={handleSubmitSuccess}
                />
            ) : (
                // isFormVisible이 false이면, 게시판을 렌더링
                <LocationBoard
                    key={refreshKey} // 이 key가 변경될 때마다 LocationBoard는 새로 데이터를 불러옴
                    onShowPostForm={handleShowForm}
                />
            )}
        </div>
    );
};

export default MapTestPage;