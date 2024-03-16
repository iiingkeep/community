// IsLikeForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Styles/MyPage.css";


const IsLikeForm = ({ userId }) => {
  const [isLike, setIsLike] = useState([]); // 게시물 목록 상태

  const [likedPosts, setLikedPosts] = useState([]); // 좋아요를 누른 포스트 목록 상태
  const [likedNews, setLikedNews] = useState([]); // 좋아요를 누른 뉴스 목록 상태

  useEffect(() => {
    const fetchLikedItems = async () => {
      try {
        // 서버에서 유저가 좋아요를 누른 포스트 정보를 가져옴
        const postResponse = await axios.get(`http://localhost:8000/is-like/posts/${userId}`);
        const postData = postResponse.data;
        setLikedPosts(postData);

        // 서버에서 유저가 좋아요를 누른 뉴스 정보를 가져옴
        const newsResponse = await axios.get(`http://localhost:8000/is-like/news/${userId}`);
        const newsData = newsResponse.data;
        setLikedNews(newsData);
      } catch (error) {
        console.error('Error fetching liked items:', error);
      }
    };
    fetchLikedItems();
  }, [userId]);

  console.log(likedNews);

  return (
    <div className="like-form">
      <div className="my-form__title">
        <p className="my-form__text">좋아요 목록</p>
      </div>
      <div className='my-content__list'>
      <p className="form-table__title">뉴스</p>
      <table className='forms-table my-forms__table'>
        <thead>
          <tr>
            {/* <th className='forms-table__num'>No.</th> */}
            <th className='forms-table__title'>썸네일</th>
            <th className='forms-table__date'>제목</th>
          </tr>
        </thead>
        <tbody className="my-like-news-list__body">
          {likedNews.map(News => (
            <tr key={News.newsid}>
              <td>
                <Link to={News.url}>
                  <img src={News.image_url}
                  className="my-like-news-list__img"
                  alt="뉴스 이미지" />
                </Link>
              </td>
              <td>
                <Link to={News.url}>
                  <span>{News.title}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className='my-content__list'>
      <p className="form-table__title">게시글</p>
      <table className='forms-table my-forms__table'>
        <thead>
          <tr>
            {/* <th className='forms-table__num'>No.</th> */}
            <th className='forms-table__title'>작성자</th>
            <th className='forms-table__date'>제목</th>
          </tr>
        </thead>
        <tbody>
          {likedPosts.map(likedPost => (
            <tr key={likedPost.postid}>
              <td>
                  <span>{likedPost.username}</span>
              </td>
              <td>
                <Link to={`/Community/Read/${likedPost.postid}`}>
                  <span>{likedPost.title}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {/* 뉴스Link to 추가 */}
    </div>
  );
};

export default IsLikeForm;