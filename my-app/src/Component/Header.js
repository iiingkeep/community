import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = ({ loggedIn, handleLogout }) => {
  const navigate = useNavigate();

  const handleMain = () => {
    navigate("/");
    window.scrollTo(0, 0);
  };

  const handleNetZero = () => {
    navigate("/NetZero");
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    navigate("/Login");
    window.scrollTo(0, 0);
  };

  const handleRegister = () => {
    navigate("/RegisterPersonal");
    window.scrollTo(0, 0);
  };

  return (
    <div className="header">
      <div className="header__logo">
        <button className="header__logo--button" onClick={handleMain}>
          빵끗😊
        </button>
      </div>
      <div className="header__menu">
        <button className="header__menu--button" onClick={handleNetZero}>
          탄소중립이란?{" "}
        </button>
        <button
          className="header__menu--button"
          onClick={() => navigate("/news")}
        >
          환경이슈{" "}
        </button>
        <button
          className="header__menu--button"
          onClick={() => navigate("/Community")}
        >
          커뮤니티{" "}
        </button>
      </div>
      <div className="header__button">
        {loggedIn ? (
          <div>
            <button
              className="header__button--button button"
              onClick={() => navigate("/MyPage")}
            >
              마이페이지
            </button>
            <button
              className="header__button--button button"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div>
            <button
              className="header__button--button button"
              onClick={() => navigate("/Login")}
            >
              로그인
            </button>
            <button
              className="header__button--button button"
              onClick={() => navigate("/RegisterPersonal")}
            >
              회원가입
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
