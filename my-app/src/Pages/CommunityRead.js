import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from 'react-router-dom';
import Comment from './Comment';
import {Icon} from '@iconify/react';
import { formattedDateAndTime } from "../Util/utils";
import './CommunityRead.css'

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
    const fetchPostAndIncrementViews = async () => {
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
  
    fetchPostAndIncrementViews();
  }, [id]);

  useEffect(() => {
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


  // 댓글 수정 함수
    const updateComment = (updatedComment) => {
      const updatedComments = comments.map(comment => {
        if (comment.commentid === updatedComment.commentid) {
          return updatedComment; // 수정된 댓글일 경우 해당 댓글로 대체
        } else {
          return comment; // 그렇지 않은 경우 기존의 댓글 유지
        }
      });
      setComments(updatedComments);
    }

  // 댓글 삭제 함수
  const deleteComment = (deletedCommentId) => {
    // 삭제된 댓글을 제외한 새로운 댓글 목록 생성
    const updatedComments = comments.filter(comment => comment.commentid !== deletedCommentId);
    // 댓글 목록 업데이트
    setComments(updatedComments);
    setCommentCount(commentCount - 1);
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
  if (loggedIn) {
    // 로그인 상태일 경우 좋아요 반영
    try {
      await axios.put(`http://localhost:8000/Community/Read/${id}/ToggleLike`, {
        userid: userid,
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('좋아요 토글 중 에러 발생:', error);
    }
  } else {
    // 로그인 상태가 아닐 경우 로그인 페이지로 이동
    if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
      navigate('/Login');
    }
  }
};
    

  // 로그인 한 유저가 게시글을 작성한 유저인지의 여부를 확인하는 변수 선언
  const isOwner = loggedIn && post.userid === userid;
 

  return (
    <div className='CommunityRead'>
      <div className='PostInfo'>
      <p>{post.username}</p>
      <p>{formattedDateAndTime(post.createdAt)}</p>
      <p><Icon icon="fluent-mdl2:view" />
      <span>{post.view}</span></p>
      <p onClick={toggleLike}><Icon icon={isLiked ? "icon-park-solid:like" : "icon-park-outline:like"} /><span>좋아요</span></p>
      </div>
      <div className='TitleBox'><h1>{post.title}</h1></div>
      {/* quill editor의 HTML태그 사용을 위한 설정. 리액트는 보안 이슈로 인해 HTML태그의 직접적인 사용을 제한하기 때문에 HTML태그 사용을 선언하는대신 DOMPurify를 사용해 보안 강화*/}
      <div className='ContentBox' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}></div>
      {/* 글 작성자 본인만 게시글 수정, 삭제 버튼 보이도록 설정 */}
      {isOwner && (
        <div className='ButtonBox'>
          <button onClick={() => navigate(`/Community/Edit/${id}`)}>수정</button>
          <button onClick={onDeleteHandler}>삭제</button>
        </div>
      )}
      {/* 댓글 표시를 위한 Comment 컴포넌트 렌더링 */}
      <div className='CommentBox'>
        <Comment loggedIn={loggedIn} userid={userid} refreshFunction={refreshFunction} commentLists={comments} post={post} commentCount={commentCount} updateComment={updateComment} deleteComment={deleteComment}/>
      </div>
      {/* 게시글 목록으로 이동할 수 있는 버튼 */}
      <div>
        <button onClick={() => navigate('/Community')}>목록</button>
      </div>
    </div>
  )
}

export default CommunityRead;