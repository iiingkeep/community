import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import PaginatedItems from '../Util/PaginatedItems';
import './Community.css';
import DOMPurify from 'dompurify';
import {Icon} from '@iconify/react';
import { formattedDateAndTime } from "../Util/utils";
// import CommunityItems from './CommunityItems';

// 게시물 목록을 페이지별로 출력하는 컴포넌트
const Community = ({loggedIn}) => {
  // 게시글 목록, 전체 게시글 갯수, 현재 페이지, 검색어, 검색유형 상태 관리
  const [posts, setPosts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [selectedCategory, setSelectedCategory] = useState(1);
  
  

  const navigate = useNavigate();
  // 검색어 업데이트
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };
  // 검색유형 업데이트
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
  };
  // 검색버튼 클릭 시 페이지를 1로 새로고침 후 게시글 불러오기
  const handleSearchButtonClick = () => {
    setCurrentPage(1);
    fetchPosts();
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  

  useEffect(() => {
    fetchPosts();
  }, [currentPage,selectedCategory]);

  // 서버의 다음 엔드포인트에 게시글 목록과 게시글의 총 갯수 GET요청
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/Community?categoryId=${selectedCategory}&page=${currentPage}&searchQuery=${searchQuery}&searchType=${searchType}`);
      setPosts(response.data.posts);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    }
  };

  // 게시글 콘텐츠에서 이미지 URL을 추출하여 썸네일 생성
const getPostThumbnail = (content) => {
  // 정규 표현식을 사용하여 이미지 URL 추출
  const regex = /<img\s+src\s*=\s*\"([^\"]+)\"/g;
  const matches = content.match(regex);
  console.log(matches)

  // 게시글에 이미지가 있는 경우 첫 번째 이미지 URL 반환, 없는 경우 null 반환
  const url = matches ? matches[0].replace('<img src="', '').replace('"', '') : null;
  console.log(url)
  return matches ? matches[0].replace('<img src="', '').replace('"', '') : 'https://img.freepik.com/free-vector/big-green-tropical-leaf-design-element-vector_53876-136546.jpg?t=st=1709001702~exp=1709005302~hmac=ef7e3256d83f1215b0ac3cafbaba39317184f077698c7700794dc84cdbd76a67&w=996';
};


// 게시글 내용에 이미지를 제외하고 표시하도록 하는 함수
const getPostContentWithoutImages = (content) => {
  return content.replace(/<img\s+[^>]*src="[^"]*"[^>]*>/g, '');
};


  // 게시글 작성 페이지로 이동하는 함수
  const goCommunityWrite = () => {
  if (loggedIn) {
    // 로그인 상태일 경우 글쓰기 페이지로 이동
    navigate('/Community/Write', { state: { selectedCategory } });
  } else {
    // 로그인 상태가 아닐 경우 로그인 페이지로 이동
    if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
      navigate('/Login');
    }
  }
};


  // 현재 페이지를 변경하는 함수
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="community-page inner">
      <h1 className='commu-header'>커뮤니티</h1>
      {/* 게시글 카테고리 탭 */}
      <div className='commu-category-box'>
        <button className={'commu-category__button' + (selectedCategory === 1 ? ' commu-category__button--selected' : '')} onClick={() => handleCategoryClick(1)}>실천기록</button>
        <button className={'commu-category__button' + (selectedCategory === 2 ? ' commu-category__button--selected' : '')} onClick={() => handleCategoryClick(2)}>자유게시판</button>
        <button className={'commu-category__button' + (selectedCategory === 3 ? ' commu-category__button--selected' : '')} onClick={() => handleCategoryClick(3)}>고민과질문</button>
      </div>
      <div className='commu-search-and-go-write-box'>
        {/* 검색창 */}
      <div className='commu-search-box'>
        <div className='commu-search-box--except-button'>
        <select className='commu-search-box__option' value={searchType} onChange={handleSearchTypeChange}>
          <option value="title">제목</option>
          <option value="content">본문</option>
          <option value="titleAndContent">제목+본문</option>
        </select>
        <input className='commu-search-box__input' type="text" value={searchQuery} onChange={handleSearchInputChange} />
        </div>
        <button className='commu-search-box__button' onClick={handleSearchButtonClick}>검색</button>
      </div>
      {/* 글쓰기 버튼 클릭 시 게시글 작성 페이지로 이동 */}
      <div className='commu-go-write-box'>
        <button className='commu-go-write-box__button' onClick={goCommunityWrite}>글쓰기</button>
      </div>
      </div>

      {/* 게시글 목록 출력 */}
      <ul className='commu-post-list-box'>
        {posts.map((post) => (
          <li key={post.postid} className='commu-post-list'>
            <Link to={`/Community/Read/${post.postid}`}>
            <div className="commu-post-list__thumbnail" style={{backgroundImage: `url('${getPostThumbnail(post.content)}')`}}></div>
            </Link>
            <div className='commu-post-info-box'>
            <div className='commu-post-list__title-and-content-and-datetime'>
            <div className='commu-post-list__title-and-content'>
            <Link to={`/Community/Read/${post.postid}`}>
              <p className='commu-post-list__title'>{post.title}</p>
              <p className='commu-post-list__content' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getPostContentWithoutImages(post.content)) }}></p>
            </Link>
            </div>
            <div className='commu-post-list__datetime'>
            <p className='commu-post-list__datetime--date'>{formattedDateAndTime(post.createdAt, 'date')}</p>
            <p className='commu-post-list__datetime--time'>{formattedDateAndTime(post.createdAt, 'time')}</p>
            </div>
            </div>
            <div className='commu-post-list__detail'>
              <div className='commu_post-list__detail--userinfo'>
            <span>{post.username}</span>
              </div>
              <div className='commu_post-list__detail--attention'>
            <span className='commu-post-list__view'>
            <Icon icon="fluent-mdl2:view" className='commu-post-list__icon'/>
            {post.view}</span>
            <span className='commu-post-list__like'>
            <Icon icon="icon-park-outline:like" className='commu-post-list__icon'/>
            {post.totalLikes}</span>
            <span className='commu-post-list__comment'>
            <Icon icon="f7:ellipses-bubble" className='commu-post-list__icon'/>
            {post.commentCount}</span>
            </div>
            </div>
            </div>
            
            
          </li>
        ))}
      </ul>
      
      {/* 페이지네이션 */}
      <div className="PagingBox">
      <PaginatedItems
          totalItems={totalItems}
          itemsPerPage={4}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Community;