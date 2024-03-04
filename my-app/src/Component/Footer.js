import React, { useState } from 'react';
import './Footer.css';

function Footer() {
    const [isListVisible, setListVisible] = useState(false);

    const toggleListVisibility = () => {
        console.log("toggleListVisibility 함수가 호출되었습니다.");
        setListVisible((prevState) => !prevState);
        console.log("isListVisible:", isListVisible);
    };

    return (
        <footer className="Footer">
            <div className="FooterLayer1">
                <span>FooterIsNarrowed</span>
            </div>
            <div className="FooterLayer2">

                <div className="FooterContent">
                    <div className="leftContent">
                    <h2>빵끗😊</h2>
                    <p>탄소중립플랫폼</p>
                    </div>
                    <address>
                        "상호명 및 호스팅 서비스 제공 : 빵끗"
                        <br />
                        "관리자 : Ezteam2CommunityTeam"
                        <br />
                        "인천광역시 남동구 인주대로 593 엔타스빌딩 12층"
                        <br />
                        "등록번호 : 000-0000-000"
                    </address>
                    <div className="labelList">
                            <button className={`label ${isListVisible ? 'active' : ''}`} onClick={toggleListVisibility}>
                                    관련 사이트 바로가기 {isListVisible ? '▲' : '▼'}
                                </button>
                                <div className={`list ${isListVisible ? 'active' : ''}`}>
                                    <ul>
                                    <a onClick={() => window.open("https://me.go.kr/home/web/main.do", "_blank")} title="새창">환경부</a>
                                    <a onClick={() => window.open("https://www.keci.or.kr/web/main.do", "_blank")} title="새창">한국환경보전원</a>
                                    <a onClick={() => window.open("https://www.gihoo.or.kr/zerolife", "_blank")} title="새창">탄소중립 실천포털</a>
                                    <a onClick={() => window.open("https://www.gihoo.or.kr/greencampus/", "_blank")} title="새창">그린캠퍼스</a>
                                    </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="FooterLayer3">
                <span>FooterIsNarrowed</span>
            </div>
        </footer>
    );
}

export default Footer;

