import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Main.css";

const Main = () => {
  const navigate = useNavigate();
  //------------------------뉴스뉴스뉴스----------------
  // news : DB 데이터(뉴스 기사 데이터) / useState는 DB 데이터를 저장하기 위해 사용
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
    <div className="Main">
      <div className="LeftSection">
        <div className="LoginBox">로그인</div>
        <div className="CloudBox">
          <img
            className=""
            src="./wc_image/result.png"
            alt="wordcloud_img"
            style={{ width: "300px", height: "300px" }}
          />
          <button className="wcDownload" onClick={handleDownload}>이미지 다운로드</button>
        </div>
      </div>
      <div className="RightSection">
        <div className="CommunityBox">커뮤니티</div>
        <div className="NewsBox">
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
  );
};

export default Main;
