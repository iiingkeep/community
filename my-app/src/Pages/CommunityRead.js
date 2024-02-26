import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from 'react-router-dom';
import Comment from './Comment';
import {Icon} from '@iconify/react';

// 게시글 상세와 댓글을 출력하는 컴포넌트
const CommunityRead = ({loggedIn, userid}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);


  useEffect(() => {
    // 서버의 다음 엔드포인트로 상세 게시글 데이터를 불러오기 위한 GET요청
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/Community/Read/${id}`);
        console.log(response.data);
        setPost(response.data);
        // 서버의 다음 엔드포인트로 게시글 조회수 증가를 위한 PUT 요청
        await axios.put(`http://localhost:8000/Community/Read/${id}/IncrementViews`);
      } catch (error) {
        console.error('게시물을 불러오는 중 에러 발생:', error);
      }
    };
    fetchPost();
    

    // 서버의 다음 엔드포인트로 댓글 데이터를 불러오기 위한 GET요청
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/Community/Read/${id}/GetComments`);
        setComments(response.data);
        setCommentCount(response.data.length);
      } catch (error) {
        console.error('댓글을 불러오는 중 에러 발생:', error);
      }
    };
    fetchComments();

    // 서버의 다음 엔드포인트로 유저의 게시글 좋아요 여부를 확인하기 위한 GET요청
    const checkLiked = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/Community/Read/${id}/CheckLiked?userid=${userid}`);
        console.log(userid)
        setIsLiked(response.data.isLiked);
      } catch (error) {
        console.error('좋아요 여부 확인 중 에러 발생:', error);
      }
    };
    checkLiked();
  }, [id, userid]);
  

  
  // 등록한 댓글이 전에 있던 댓글 다음으로 바로 출력되어 나오도록 하는 함수 생성
  const refreshFunction = (newComment) => {
    setComments(comments.concat(newComment));
    setCommentCount(commentCount + 1);
}
  
  // post가 없을 경우 'Loading...' 표시
  if (!post) {
    return <div>Loading...</div>;
  }

  // 삭제 버튼 클릭 시 호출되는 핸들러 함수
  const onDeleteHandler = async () => {
    // 삭제 확인 창 출력
  const userConfirmed = window.confirm('정말로 게시글을 삭제하시겠습니까?');

  // 사용자가 확인을 선택한 경우에만 삭제 진행
  if (userConfirmed) {
    try {
      await axios.delete(`http://localhost:8000/Community/Read/${id}`);
      // 삭제가 성공하면 게시물 목록 페이지로 리다이렉트
      navigate('/Community');
    } catch (err) {
      console.error('게시물 삭제 중 에러 발생:', err);
    }
  }
  };


  const toggleLike = async () => {
    try {
      await axios.put(`http://localhost:8000/Community/Read/${id}/ToggleLike`, {
        userid: userid,
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('좋아요 토글 중 에러 발생:', error);
    }
  };

  // 로그인 한 유저가 게시글을 작성한 유저인지의 여부를 확인하는 변수 선언
  const isOwner = loggedIn && post.userid === userid;
 

  return (
    <div className='CommunityRead'>
      <div>
      <p>{post.username}</p>
      <p>{post.createdAt}</p>
      <p><Icon icon="fluent-mdl2:view" />
      <span>{post.view}</span></p>
      <p onClick={toggleLike}><Icon icon={isLiked ? "icon-park-solid:like" : "icon-park-outline:like"} /><span>좋아요</span></p>
      </div>
      <h1>{post.title}</h1>
      {/* quill editor의 HTML태그 사용을 위한 설정. 리액트는 보안 이슈로 인해 HTML태그의 직접적인 사용을 제한하기 때문에 HTML태그 사용을 선언하는대신 DOMPurify를 사용해 보안 강화*/}
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}></div>
      {/* 글 작성자 본인만 게시글 수정, 삭제 버튼 보이도록 설정 */}
      {isOwner && (
        <div className='ButtonBox'>
          <button onClick={() => navigate(`/Community/Edit/${id}`)}>수정</button>
          <button onClick={onDeleteHandler}>삭제</button>
        </div>
      )}
      {/* 댓글 표시를 위한 Comment 컴포넌트 렌더링 */}
      <div className='CommentBox'>
        <Comment userid={userid} refreshFunction={refreshFunction} commentLists={comments} post={post} commentCount={commentCount}/>
      </div>
      {/* 게시글 목록으로 이동할 수 있는 버튼 */}
      <div>
        <button onClick={() => navigate('/Community')}>목록</button>
      </div>
    </div>
  )
}

export default CommunityRead;