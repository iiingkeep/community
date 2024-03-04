import React, { useState, useEffect } from "react";
// 로그인 추가
import { Link, useNavigate } from "react-router-dom";
// 로그인 추가 끝
import axios from "axios";
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
          setloginStatus("로그인 실패: " + response.data.message);
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
          <input
            id="id"
            type="text"
            placeholder="아이디"
            value={email}
            onChange={(e) => setemail(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <div className="loginButtonArea">
            {/* 로그인 버튼 */}
            <button onClick={LoginPageJs}>로그인</button>
            {/* 회원가입 링크 */}
            <button onClick={() => navigate("/Register")}>회원가입</button>
          </div>
          {loginStatus && <div>{loginStatus}</div>}
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

  const topFiveNews = news.slice(0, 5);
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
    <div className="wrap">
      <div className="Main2"></div>
      <div className="Main">
        <div className="LeftSection">
          {/* 로그인 구역 */}
          <div className="LoginBox">
            <p>로그인</p>
            {renderContent()}
          </div>
          {/* 로그인 구역 끝 */}
          <div className="CloudBox">
            <img
              className=""
              src="./wc_image/result.png"
              alt="wordcloud_img"
              style={{ width: "300px", height: "300px" }}
            />
            <button className="wcDownload" onClick={handleDownload}>
              이미지 다운로드
            </button>
          </div>
        </div>
        <div className="RightSection">
          <div className="CommunityBox">커뮤니티</div>
          <div className="NewsBox">
            <a href="/news">환경이슈</a>
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
      </div>
    </div>
  );
};

export default Main;
