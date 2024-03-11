import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formattedDateAndTime } from "../Util/utils";
import './SingleComment.css'

// 작성된 원본 단일 댓글 표시, 각 댓글에 답글을 작성하는 컴포넌트
const SingleComment = ({loggedIn, userid, comment, refreshFunction, updateComment, deleteComment}) => {
  const { id } = useParams();
  const [openReply, setOpenReply] = useState(false);
  const [commentValue, setCommentValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  // 댓글 수정 버튼 클릭 시 호출되는 함수
  const handleEdit = () => {
    setCommentValue(comment.content); // 댓글 내용을 폼에 채우기 위해 상태 업데이트
    setIsEditing(true); // 수정 상태로 변경
  };

  // 댓글 취소 버튼 클릭 시 호출되는 함수
  const handleCancel = () => {
    setIsEditing(false); // 수정 상태 취소
    setCommentValue(''); // 폼 초기화
  };

  // 댓글 내용 변경 시 호출되는 함수
  const onHandleCommentChange = (e) => {
    setCommentValue(e.target.value);
  };

  // 댓글에 답글을 다는 폼을 열고 닫는 함수
  // '답글 달기' 클릭 시 아래에 폼 제공
  const onClickReplyOpen = () => {
    setOpenReply(!openReply)
  }
  // 답글 내용(commentValue) 업데이트 
  const onHandleChange = (e) => {
    setCommentValue(e.target.value);
  }
  // 답글 등록 버튼 클릭 시 호출되는 핸들러 함수
  const onReplySubmit = async (e) => {
    e.preventDefault();
    if (loggedIn) {
      try{
        // 서버의 다음 엔드포인트로 답글 정보(게시글id, 작성한 답글의 내용, 부모댓글id) 데이터 전송을 위한 POST요청
        const response = await axios.post(`http://localhost:8000/Community/Read/${id}/SaveComment`, {
            userid: userid,
            postId: id,
            content: commentValue,
            responseTo: comment.commentid,
          });
          console.log(response.status);
          console.log(response.data);
      
          // 답글 등록 성공 시 알림, 답글 창 초기화 및 닫힘
          // refreshFunction으로 새로 등록한 답글 즉시 렌더링
          if (response&&response.status===201) {
            console.log('답글이 등록되었습니다.');
            alert('답글이 등록되었습니다.');
            setCommentValue('');
            setOpenReply(false);
            refreshFunction(response.data.result)
          } // 답글 등록 실패 시 알림
          else {
            console.error('예상치 못한 응답:', response);
            alert('답글 등록에 실패했습니다. 다시 한 번 시도해주세요.')
          } // 에러 발생 시 알림
        }catch(error) {
          console.error('에러 발생:', error);
          alert('답글 작성에 실패했습니다. 다시 한 번 시도해주세요.')
        }
    } else {
        // 로그인 상태가 아닐 경우 로그인 페이지로 이동
        if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
          navigate('/Login');
        }
        
    }

    
    }
  
    const onUpdateComment = async (e) => {
      const editComfirmed = window.confirm("댓글 수정을 완료하시겠습니까?");
      if (editComfirmed) {
      try {
        const response = await axios.put(`http://localhost:8000/Community/Read/${id}/UpdateComment`, {
          commentid: comment.commentid,
          content: commentValue,
        });
        if (response && response.status === 200) {
          console.log('댓글이 수정되었습니다.');
          alert('댓글이 수정되었습니다.');
          updateComment(response.data.result);
          setIsEditing(false); // 수정 상태 종료
        } else {
          console.error('예상치 못한 응답:', response);
          alert('댓글 수정에 실패했습니다. 다시 한 번 시도해주세요.');
        }
      } catch (error) {
        console.error('에러 발생:', error);
        alert('댓글 수정에 실패했습니다. 다시 한 번 시도해주세요.');
      }
    }
    };
    
    const onDeleteComment = async () => {
      const userConfirmed = window.confirm('정말로 댓글을 삭제하시겠습니까?');

      // 사용자가 확인을 선택한 경우에만 삭제 진행
      if (userConfirmed) {
      try {
        const response = await axios.delete(`http://localhost:8000/Community/Read/${id}/DeleteComment/${comment.commentid}`);
        if (response && response.status === 200) {
          console.log('댓글이 삭제되었습니다.');
          alert('댓글이 삭제되었습니다.');
          deleteComment(comment.commentid); // 해당 댓글 삭제 후 UI 갱신
        } else {
          console.error('예상치 못한 응답:', response);
          alert('댓글 삭제에 실패했습니다. 다시 한 번 시도해주세요.');
        }
      } catch (error) {
        console.error('에러 발생:', error);
        alert('댓글 삭제에 실패했습니다. 다시 한 번 시도해주세요.');
      }
    }
    };
    
    return (
      <div className="Comment">
        <div className="comment_single">
          {/* 댓글 수정버튼 클릭 했을 때와 클릭하지 않았을 때(기본)
          출력상태 지정 */}
          {isEditing ? ( // 댓글 수정 상태일 때 폼 출력
            <form className="comment_form" onSubmit={onUpdateComment}>
              <span className='name_box__editing'>{comment.username}</span>
              <textarea
                className="comment_single_content"
                value={commentValue}
                onChange={onHandleCommentChange}
              />
              <div className="btn_box">
                <button type="submit">등록</button>
                <button type="button" onClick={handleCancel}>
                  취소
                </button>
              </div>
            </form>
          ) : ( // 댓글을 수정하지 않는 기본 상태
            <div className="single_comment_box">
              <div className="comment_detail_box">
                <div className="name_date_box">
                  {comment.username}
                  <p className="date_box">
                    {formattedDateAndTime(comment.createdAt)}
                  </p>
                </div>
                <div className="content_box">{comment.content}</div>
                <span className="btn_reply" onClick={onClickReplyOpen}>
                  {" "}
                  답글 달기
                </span>
              </div>
              <div className="btn_edit_delete">
                {userid === comment.userid && (
                  <>
                    <button onClick={handleEdit}>수정</button>
                    <button onClick={onDeleteComment}>삭제</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        {/* 답글 달기 버튼을 클릭하여 openReply=true가 되면 답글 작성, 등록 폼 제공 */}
        <div className="reply_comment_box__write">
          {openReply && (
            <form onSubmit={onReplySubmit} className="comment_form">
              <textarea
                className="comment_content"
                onChange={onHandleChange}
                value={commentValue}
                placeholder="답글을 작성해 보세요."
              />
              <button className="btn_submit" onClick={onReplySubmit}>
                답글 등록
              </button>
            </form>
          )}
        </div>
      </div>
    );
}

export default SingleComment;