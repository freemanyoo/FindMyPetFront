import React from 'react';
import { Link } from 'react-router-dom'; // ✅ react-router-dom에서 Link를 import

const Home = () => {
    return (
        <div>
            <h1>메인 페이지</h1>
            <p>찾아줘요 프로젝트에 오신 것을 환영합니다.</p>

            {/* ✅ Link 컴포넌트를 사용해 상세 페이지로 이동하는 링크 추가 */}
            <Link to="/posts/1">
                1번 게시글 보러가기 (댓글 기능 테스트)
            </Link>
        </div>
    );
};

export default Home;