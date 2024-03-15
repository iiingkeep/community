import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "react-js-pagination";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./News.css";
import { formattedDateAndTime } from "../Util/utils";

const News = () => {
  const [news, setNews] = useState([]); // news : DB에 있는 뉴스 데이터
  const [page, setPage] = useState(1); // page : 현재 페이지
  const [currenPosts, setCurrenPosts] = useState([]); // currenPosts : 현재 페이지에 보이는 기사들
  const [sortBy, setSortBy] = useState("latest"); // 정렬(sortBy에 기본값으로 'latest' 설정)
  const [searchTerm, setSearchTerm] = useState(""); // 검색
  const [searchButtonClicked, setSearchButtonClicked] = useState(false); // 검색 버튼
  const [likedArticles, setLikedArticles] = useState([]); // 좋아요
  const [loggedIn, setLoggedIn] = useState([]); // 로그인 상태
  const [userid, setUserid] = useState([]); // userid 데이터

  useEffect(() => {
    if (JSON.parse(sessionStorage.getItem("loggedIn")) === true) {
      setLoggedIn(JSON.parse(sessionStorage.getItem("loggedIn")));
      setUserid(JSON.parse(sessionStorage.getItem("userData")).userid);
    }
  }, [loggedIn, userid]);

  const navigate = useNavigate();

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

  // articlesPerPage : 한 페이지에서 보이는 기사 개수
  // indexOfLastArticle : 한 페이지의 마지막 기사의 인덱스
  // indexOfFirstArticle : 한 페이지의 첫번째 기사의 인덱스
  const articlesPerPage = 10;
  const indexOfLastArticle = page * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;

  // 검색
  // searchButtonClicked 상태가 true 이면 검색 버튼이 클릭되었다는 것을 의미하며
  // news 배열에서 searchTerm에 해당하는 뉴스 필터링하고
  // toLowerCase()를 사용해서 대소문자 무시하고 비교해 filteredNews 배열 생성
  // searchButtonClicked 상태가 false 이면 그냥 news의 값을 사용
  const filteredNews = searchButtonClicked
    ? news.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : news;

  useEffect(() => {
    // filteredNews 배열에서 현재 페이지에 해당하는 기사들만 currenPosts의 값으로 설정
    // setCurrenPosts() : 현재 페이지에서 보이는 뉴스기사들은 filteredNews를
    // 해당 페이지의 첫 기사의 인덱스부터 마지막 기사의 인덱스까지 잘라서 보여줌
    setCurrenPosts(filteredNews.slice(indexOfFirstArticle, indexOfLastArticle));
  }, [page, filteredNews]);

  // 정렬
  useEffect(() => {
    let sortedNews = [...news];
    // 최신순
    if (sortBy === "latest") {
      sortedNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      // 오래된순
    } else if (sortBy === "oldest") {
      sortedNews.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
      // 조회수 높은 순
    } else if (sortBy === "viewsHigh") {
      sortedNews.sort((a, b) => b.views - a.views);
    }
    setNews(sortedNews);
  }, [sortBy]);

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

  // 로고 클릭시 초기페이지로 돌아감
  const handleLogoClick = () => {
    setPage(1);
    setSearchTerm("");
    setSortBy("latest");
    setSearchButtonClicked(false);
  };

  // 페이지 변화 핸들링 함수
  const handleChangePage = (page) => {
    setPage(page);

    // 페이지 이동 후 스크롤을 맨 위로 이동
    window.scrollTo({ top: 0 });
  };

  // 검색 핸들링
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSearchButtonClicked(false);
  };

  // 검색 버튼 핸들링
  const handleSearchButtonClick = () => {
    setSearchButtonClicked(true);
    setPage(1);
  };

  // 검색 input에서 엔터 키를 눌렀을 때 검색 버튼 클릭과 동일한 작동
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchButtonClick();
    }
  };

  // 정렬 핸들링
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // 정렬시 1페이지로 이동
  };

  // 좋아요
  useEffect(() => {
    // 로그인 안되어있는 경우
    if (!sessionStorage.getItem("userData")) {
      return;
    }

    axios.get("http://localhost:8000/news/likes").then((response) => {
      const likedArticles = {};

      // 현재 로그인된 사용자의 userid
      const loggedInUserId = JSON.parse(
        sessionStorage.getItem("userData")
      ).userid;

      // 서버에서 받아온 좋아요 데이터를 사용자별로 분류하여 저장
      response.data.forEach((article) => {
        const { userid, newsid, news_isLiked } = article;
        // 현재 로그인된 사용자와 해당 기사의 userid가 일치하는 경우에만 추가
        if (userid === loggedInUserId) {
          likedArticles[newsid] = news_isLiked === 1;
        }
      });
      setLikedArticles(likedArticles);
      console.log(likedArticles);
    });
  }, []);

  // 좋아요 버튼 클릭 시 호출되는 함수
  const handleLikeClick = (newsid, loggedIn, userid) => {
    console.log(loggedIn, userid);
    if (loggedIn !== true) {
      if (
        window.confirm(
          "로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?"
        )
      ) {
        navigate("/Login");
      } else {
        navigate("/News");
      }
      return;
    } else {
      // 좋아요 상태 변경 토글
      const updatedLikedArticles = {
        ...likedArticles,
        [newsid]: !likedArticles[newsid],
      };
      setLikedArticles(updatedLikedArticles);

      // 서버로 좋아요 상태 업데이트 요청
      axios
        .post("http://localhost:8000/news/likes", {
          userid: userid,
          newsid: newsid,
          news_isLiked: !likedArticles[newsid] ? 1 : 0,
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return (
    <div className="news-page inner">
      <Link to="/news">
        <div className="com-header">
          <h1 className="com-header__title" onClick={handleLogoClick}>
            환경이슈{" "}
            <p className="com-header__title--detail">
              아침에 일어나서 한 번, 저녁 식사 후 한 번<br />
              최신 환경 동향에 대해 파악하고 생각해 보는 시간을 가질 수 있어요
            </p>
          </h1>
          <img className="com-header__img" src="background_img/news8.png" />
        </div>
      </Link>
      {/* 검색 */}
      <div className="news-search-and-sort-box">
        <div className="news-search-box">
          <input
            type="text"
            placeholder="뉴스 검색"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          {/* 검색 버튼 추가 */}
          <button onClick={handleSearchButtonClick}>검색</button>
        </div>
        {/* 정렬 */}
        <select
          className="news-sort-box"
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="viewsHigh">조회수 높은순</option>
        </select>
      </div>
      {/* 뉴스 목록 */}
      <ul className="news-list">
        {currenPosts.map((item) => (
          <div className="news-list-box">
            <li key={item.newsid}>
              {/* 썸네일 */}
              <div className="news-list__img-box">
              <img
                src={item.image_url}
                alt="뉴스 썸네일"
                onClick={() => handleClick(item)}
              />
              </div>
              {/* 제목 */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleClick(item)}
              >
                {item.title}
              </a>
              {/* 조회수 */}
              <p>
                <Icon icon="fluent-mdl2:view" />
                <span className="news-list__views">{item.views}</span>
              </p>
              {/* 좋아요 */}
              <div className="news-like__button">
                <button
                  onClick={() => handleLikeClick(item.newsid, loggedIn, userid)}
                >
                  {likedArticles[item.newsid] ? (
                    <Icon icon="icon-park-solid:like" />
                  ) : (
                    <Icon icon="icon-park-outline:like" />
                  )}
                </button>
              </div>
              <div className="news-list__datetime">
                <p>
                  {formattedDateAndTime(item.pubDate, "date")}{" "}
                  {formattedDateAndTime(item.pubDate, "time")}
                </p>
              </div>
            </li>
          </div>
        ))}
      </ul>
      {/* 페이지네이션 */}
      <Pagination
        activePage={page}
        itemsCountPerPage={articlesPerPage}
        totalItemsCount={filteredNews.length}
        pageRangeDisplayed={5}
        prevPageText={"<"}
        nextPageText={">"}
        onChange={handleChangePage}
      />
    </div>
  );
};

export default News;
