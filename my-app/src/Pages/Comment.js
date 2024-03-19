import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {Icon} from '@iconify/react';
import SingleComment from './SingleComment';
import ReplyComment from './ReplyComment';
import './Comment.css'


// 댓글 작성, 등록 컴포넌트
const Comment = ({loggedIn, userid, commentLists, refreshFunction, updateComment, deleteComment, commentCount}) =>{
  const { id } = useParams();
  const [comment, setComment] = useState('');

  const navigate = useNavigate();

  // 댓글 내용(comment) 업데이트
  const onCommentHandle = (e) => {
    setComment(e.target.value);
  }

  // 댓글 등록 버튼 클릭 시 호출되는 핸들러 함수. 
  const onSubmit = async(e) => {
    e.preventDefault();
    if (loggedIn) {
      // 로그인 한 상태일 경우 서버의 다음 엔드포인트로 댓글 정보(게시글id, 작성한 댓글의 내용, 부모댓글id) 데이터 전송을 위한 POST요청
    try{
      if (!comment.trim()) {
        alert('내용을 입력해주세요.');
        document.querySelector('.commu-comment__content').focus();
        return;
      }
      const response = await axios.post(`http://localhost:8000/Community/Read/${id}/SaveComment`, {
          userid: userid,
          postid: id,
          content: comment,
        });
        console.log(response.status);
        console.log(response.data);
        // 댓글 등록 성공 시 알림 + 댓글창 비우기
        // refreshFunction으로 새로 등록한 댓글 즉시 렌더링
        if (response&&response.status===201) {
          alert('댓글이 등록되었습니다.');
          refreshFunction(response.data.result);
          setComment('');
        } // 댓글 등록 실패 시 알림
        else {
          console.error('예상치 못한 응답:', response);
          alert('댓글 등록에 실패했습니다. 다시 한 번 시도해주세요.')
        } // 에러 발생 시 알림
      }catch(err) {
        console.error('에러 발생:', err);
        alert('글 작성에 실패했습니다. 다시 한 번 시도해주세요.')
      }
    } else {
      // 로그인 상태가 아닐 경우 로그인 페이지로 이동
      if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        navigate('/Login');
      }
    }
    
  }
  

  return(
    <div className='commu-comment-box'>
      {/* 댓글 갯수 표현 */}
      <p className='commu-comment__count-box'>
        <Icon icon="f7:ellipses-bubble" />
        <span className='commu-comment__count'>{commentCount}개의 댓글</span>
      </p>
      {/* 댓글 목록이 담긴 배열 commentLists를 map함수를 이용해 새로운 배열로 반환 */}
      {commentLists && commentLists.map((comment, index) => (
        // !comment.responseTo: 답글이 아닌 원본 댓글만 리렌더링
        // 원본 댓글 목록 출력 시 댓글에 답글을 달 수 있는 SingleComment와 댓글에 달린 답글을 볼 수 있도록 하는 ReplyComment 컴포넌트 함께 출력 
        (!comment.responseTo &&
        <React.Fragment key={index}>
        <SingleComment className='commu-single-comment-box' loggedIn={loggedIn} userid={userid} refreshFunction={refreshFunction} updateComment={updateComment} deleteComment={deleteComment}  comment={comment}/>
        <ReplyComment className='commu-reply-comment-box' loggedIn={loggedIn} userid={userid} refreshFunction={refreshFunction} updateComment={updateComment} deleteComment={deleteComment} parentCommentId={comment.commentid}  commentLists={commentLists} postId={id}/>
        </React.Fragment>
        )
      ))}

      {/* 댓글 작성, 등록 폼 */}
      <form onSubmit={onSubmit} className='commu-comment__form commu-comment__form--origin'>
        <textarea className='commu-comment__content'
          onChange={onCommentHandle}
          value={comment}
          placeholder='댓글을 작성해 보세요.'/>
        <button className='commu-comment__button--submit' onClick={onSubmit}>댓글 등록</button>
      </form>
    </div>
  )
}

export default Comment;