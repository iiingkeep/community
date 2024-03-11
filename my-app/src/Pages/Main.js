import React, { useState, useEffect } from "react";
// 로그인 추가
import { Link, useNavigate } from "react-router-dom";
// 로그인 추가 끝
import axios from "axios";
import {Icon} from '@iconify/react';
import "./Main.css";

const Main = () => {
  //------------------------로그인로그인----------------
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setloginStatus] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedLoggedIn = sessionStorage.getItem("loggedIn");
    if (storedLoggedIn) {
      setLoggedIn(true);
    }
  }, [setLoggedIn]);

  const LoginPageJs = () => {
    console.log("LoginPageJs 함수 호출됨"); //스크립트 동작시 콘솔에 출력

    // 로그인 요청 구현
    axios
      .post("http://localhost:8000/Login", {
        email: email,
        password: password,
      }) //회원 정보 email, password의 정보를 가져옴
      .then((response) => {
        console.log("서버 응답:", response);
        if (response.data.success) {
          const { userid, username } = response.data.data[0]; //0213 김민호 익스플로우세션
          const userData = {
            userid: userid,
            username: username,
          };
          sessionStorage.setItem("loggedIn", true);
          sessionStorage.setItem("userData", JSON.stringify(userData)); // 0210 상호형 추가 세션에 userNumber,username추가
          //Application에 세션스토리지 안에서 정보를 출력한다

          navigate("/");
          window.location.reload(); //0210 상호형 추가 페이지를강제로 리로드
        } else {
          // 로그인 실패 시 처리
          console.log("로그인 실패:", response.data);
          setloginStatus(response.data.message);
          alert("일치하는 유저가 없습니다. 다시 입력해 주세요")
        }
      });
  };
  // 로그아웃
  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("loggedIn");
    setLoggedIn(false);
    navigate("/");
    window.location.reload();
  };

  const renderContent = () => {
    if (!loggedIn) {
      // 로그인이 안되어 있는 경우
      return (
        <>
          {/* 로그인 아이디, 비밀번호 입력 폼 */}
          <div className="main-login-form--input-and-button">
          <input
            id="id"
            className="main-login__form--id"
            type="text"
            placeholder="아이디"
            value={email}
            onChange={(e) => setemail(e.target.value)}
          />
          <input
            type="password"
            className="main-login__form--password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="main-login__form--button-box">
            {/* 로그인 버튼 */}
            <button className="main-login__form--button--login" onClick={LoginPageJs}>로그인</button>
            {/* 회원가입 링크 */}
            <button className="main-login__form--button--register" onClick={() => navigate("/RegisterPersonal")}>회원가입</button>
          </div>
          </div>
          {/* {loginStatus && <div className="main-login__form--message">{loginStatus}</div>} */}
        </>
      );
    } else {
      // 로그인이 되어 있는 경우
      return (
        <>
          <p>마이페이지</p>
          {/* 로그아웃 버튼 */}
          <button className="Btn" onClick={handleLogout}>
            로그아웃
          </button>
        </>
      );
    }
  };
  //------------------------로그인 끝----------------

  //------------------------뉴스뉴스뉴스----------------
  const [news, setNews] = useState([]);

  // 뉴스 정보 가져오기
  useEffect(() => {
    // /news 엔드포인트에서 데이터를 가져오는 함수 호출
    axios
      .get("http://localhost:8000/news")
      .then((response) => {
        // 최신순으로 정렬
        const sortedNews = response.data.sort(
          (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
        );
        setNews(sortedNews);
      })
      .catch((error) => {
        console.error("뉴스 데이터 불러오는 중 에러 발생:", error);
      });
  }, []);

  // 기사 클릭 시 조회수 증가(썸네일, 제목에 사용)
  const handleClick = (item) => {
    const clickedNews = news.map((n) =>
      n.newsid === item.newsid ? { ...n, views: n.views + 1 } : n
    );
    setNews(clickedNews);

    // 서버로 조회수 데이터 전송
    axios
      .post("http://localhost:8000/news/views", {
        newsid: item.newsid, // newsid 이름으로 기사 newsid 정보를 넘겨줌
        views: item.views + 1, // views라는 이름으로 기사 조회수 정보를 넘겨줌
      })
      .then((response) => console.log(response.data))
      .catch((error) => console.error(error));

    // 기사 링크 열기
    window.open(item.url, "_blank");
  };

  const topFiveNews = news.slice(0, 4);
  //------------------------뉴스뉴스뉴스 끝----------------
  //------------------------워드클라우드----------------
  // 워드클라우드 이미지 다운로드
  const imageUrl = "http://localhost:3000/wc_image/result.png";

  const handleDownload = async () => {
    try {
      // 이미지 가져오기
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // 파일 저장 위치 선택 및 파일 형식 지정
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: "image.jpg",
        types: [
          { accept: { "image/jpeg": [".jpg"] } },
          { accept: { "image/png": [".png"] } },
        ],
      });

      // 사용자가 선택한 파일 핸들을 사용하여 파일을 저장합니다.
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();
    } catch (error) {
      console.error("파일을 다운로드하는 동안 오류가 발생했습니다.", error);
    }
  };
  //------------------------워드클라우드 끝----------------

  return (
    <div className="MainBody">
      <div className="wrap">
        <div className="section s1">
          <div className="slogan_box">
            <p className="slogan__title">Bring Back A Natural, Green environment</p>
            <div className="slogan__content">
            <p>지속 가능한 미래를 위한</p>
            <p>탄소중립 실천</p>
            <p>빵끗과 함께 해요</p>
            </div>
          </div>
          <div className="main-login-form">
              {renderContent()}
            </div>
          <img
            src="/background_img/earth1.png"
            className="earth"
            alt="지구 이미지"
          />
        </div>
        <div className="section s2 ">
          <div className="main-inner main-intro-box1">
          <p className="main-header">탄소중립, 함께 실천해요</p>
          <div className="main-intro-box2">
            <div className="main-intro main-intro__net-zero">
              <img src="/background_img/netzero1.png"
              className="main-intro__img" />
              <p className="main-intro__title">탄소중립이란?</p>
              <p className="main-intro__content">탄소중립이 무엇인지,
             </p>
             <p className="main-intro__content main-intro__content--line2">어떻게 실천해야 하는지 알아봐요</p>
             <p className="main-intro__content main-intro__link" onClick={() => navigate("/NetZero")}><Icon icon="ci:arrow-right-lg" className="main-intro__icon" />이동하기</p>
            </div>
            <div className="main-intro main-intro__news">
            <img src="/background_img/news7.png"
              className="main-intro__img" />
              <p className="main-intro__title">환경이슈</p>
              <p className="main-intro__content">하루 두 번, 오전 6시와 오후 6시</p>
              <p className="main-intro__content main-intro__content--line2">최신 환경 이슈들을 만나 봐요</p>
              <p className="main-intro__content main-intro__link" onClick={() => navigate("/News")}><Icon icon="ci:arrow-right-lg" className="main-intro__icon" />이동하기</p>
            </div>
            <div className="main-intro main-intro__community">
            <img src="/background_img/community3.png"
              className="main-intro__img" />
              <p className="main-intro__title">커뮤니티</p>
              <p className="main-intro__content">자유롭게 소통해요</p>
              <p className="main-intro__content main-intro__content--line2">탄소중립 실천 기록도 남기고, 고민도 나눠요</p>
              <p className="main-intro__content main-intro__link" onClick={() => navigate("/Community")}><Icon icon="ci:arrow-right-lg" className="main-intro__icon" />이동하기</p>
            </div>
          </div>
          </div>
        </div>
        <div className="section s3">
          <p className="main-header main-issue__header">오늘의 핫 이슈에요🔥</p>
            {/* 로그인 구역 */}
            {/* <div className="main-login-form">
              {renderContent()}
            </div> */}
            {/* 로그인 구역 끝 */}
            <div className="main-issue-box">
            <div className="main-issue-inner">
            <div className="main-issue__phrase">
            <p className="main-issue__phrase--title">환경이슈</p>
            <p className="main-issue__phrase--content">
              최신 환경뉴스와 핫 토픽
            </p>
            <p className="main-issue__phrase--content--detail">
            아침에 일어나서 한 번, 저녁 식사 후 한 번<br />
            업데이트 되는 환경 뉴스를 통해 최신 환경 동향에 대해 파악하고 생각해 보는 시간을 가질 수 있어요<br />
            지난 12시간동안 가장 핫했던 키워드가 무엇인지 바로 알 수 있는 클라우드 이미지도 제공하고 있답니다
            </p>
            </div>
            <div className="main-issue__wordcloud-and-news-box">
            <div className="main-issue__wordcloud-box">
              <p className="main-issue__name">지구촌 이슈</p>
              <img
                className="main-issue__wordcloud"
                src="./wc_image/result.png"
                alt="wordcloud_img"
              />
              <button
                className="main-issue__wordcloud__button"
                onClick={handleDownload}
              >
                이미지 다운로드
              </button>
            </div>
            <div className="main-issue__news-box">
            <p className="main-issue__name">뉴스 미리보기</p>
              <ul>
                {topFiveNews.map((item) => (
                  <li key={item.newsid}>
                    <img
                      src={item.image_url}
                      alt="뉴스 썸네일"
                      onClick={() => handleClick(item)}
                    />
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleClick(item)}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            </div>
        <div className="main-issue__phrase main-issue__phrase--community">
            <p className="main-issue__phrase--title">커뮤니티</p>
            <p className="main-issue__phrase--content">
              탄소중립 실천 경험 나누기 
            </p>
            <p className="main-issue__phrase--content--detail">
            다른 사람들은 탄소중립을 어떻게 실천하고 있을까요?<br />
            팁도 얻고 고민도 해결해요. 실천기록을 남기면 칭찬과 격려 속에 뿌듯함은 두 배 !<br />
            </p>
            </div>

            <div className="main-issue__news-box main-issue__community-box">
            
            </div>

            </div>
        </div>
          </div>
        </div>
      </div>
  );
};

export default Main;
