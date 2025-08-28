import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {

    const homeSectionStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 150px)',
        textAlign: 'center',
        color: 'white',
        // 배경 이미지 URL을 추가
        backgroundImage: `
      linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
      url('https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <section id="home" className="home-section" style={homeSectionStyle}>
            <div className="home-content">
                <h1 className="home-title">가족을 찾아요</h1>
                <p className="home-subtitle">
                    소중한 우리 가족이 길을 잃었나요?<br />
                    찾아줘요 에서 도와드릴게요.
                </p>
                <div className="home-buttons">
                    <Link to="/board/missing" className="home-btn">
                        <i className="fas fa-search"></i>
                        가족을 찾아요
                        <small>실종된 우리 가족을 찾고 있어요</small>
                    </Link>
                    <Link to="/board/shelter" className="home-btn">
                        <i className="fas fa-heart"></i>
                        주인을 기다려요
                        <small>주인을 찾아주고 있어요</small>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HomePage;
