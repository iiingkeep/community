import React from "react";
import "./NetZero.css";

const NetZero = () => {
    return (
      <div className="carbon-page inner">
        {/* 탄소중립이란? 헤더 */}
        <div className='com-header '>
          <h1 className='com-header__title'>탄소중립이란?
          <p className='com-header__title--detail'>탄소중립에 대해 소개합니다<br />
          탄소중립이 무엇인지 함께 알아봐요</p>
          </h1>
          <img className="com-header__img" src='background_img/netzero2.png' />
        </div>
        <img className="carbon-img" src="./carbon.png" alt="탄소중립 설명 이미지"></img>
      </div>
    );
};

export default NetZero;
