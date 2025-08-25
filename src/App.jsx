import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Layout 컴포넌트 경로는 실제 프로젝트에 맞게 확인해주세요.
import Home from './components/Home'; // Home 컴포넌트 경로는 실제 프로젝트에 맞게 확인해주세요.
import PostDetailPage from './pages/PostDetailPage'; // ✅ PostDetailPage import 추가

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    {/* ✅ 게시글 상세 페이지를 위한 동적 라우트 추가 */}
                    <Route path="/posts/:postId" element={<PostDetailPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;