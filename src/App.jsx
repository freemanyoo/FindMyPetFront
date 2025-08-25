import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* 여기에 다른 라우트를 추가할 수 있습니다. */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;