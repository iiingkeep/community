import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { formattedDateAndTime } from "../Util/utils";

// 작성된 원본 단일 댓글 표시, 각 댓글에 답글을 작성하는 컴포넌트
const SingleComment = ({userid, comment, refreshFunction}) => {
  const { id } = useParams();
  const [openReply, setOpenReply] = useState(false);
  const [commentValue, setCommentValue] = useState('');

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
  const onSubmit = async (e) => {
    e.preventDefault();

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
    }
  
    const onUpdateComment = async () => {
      try {
        const response = await axios.put(`http://localhost:8000/Community/Read/${comment.postid}/UpdateComment`, {
          commentId: comment.commentid,
          content: commentValue,
        });
        if (response && response.status === 200) {
          console.log('댓글이 수정되었습니다.');
          alert('댓글이 수정되었습니다.');
          refreshFunction(response.data.result);
        } else {
          console.error('예상치 못한 응답:', response);
          alert('댓글 수정에 실패했습니다. 다시 한 번 시도해주세요.');
        }
      } catch (error) {
        console.error('에러 발생:', error);
        alert('댓글 수정에 실패했습니다. 다시 한 번 시도해주세요.');
      }
    };
    
    const onDeleteComment = async () => {
      try {
        const response = await axios.delete(`http://localhost:8000/Community/Read/${comment.postid}/DeleteComment/${comment.commentid}`);
        if (response && response.status === 200) {
          console.log('댓글이 삭제되었습니다.');
          alert('댓글이 삭제되었습니다.');
          refreshFunction(comment.commentid); // 해당 댓글 삭제 후 UI 갱신
        } else {
          console.error('예상치 못한 응답:', response);
          alert('댓글 삭제에 실패했습니다. 다시 한 번 시도해주세요.');
        }
      } catch (error) {
        console.error('에러 발생:', error);
        alert('댓글 삭제에 실패했습니다. 다시 한 번 시도해주세요.');
      }
    };
    
    return (
      <div>
        <div>
          {comment.username}
          {comment.content}
          {formattedDateAndTime(comment.createdAt)}
          {userid === comment.userid && ( // 댓글 작성자일 때만 수정 및 삭제 버튼을 표시
            <>
              <span onClick={onClickReplyOpen}> --답글 달기</span>
              <button onClick={onUpdateComment}>수정</button>
              <button onClick={onDeleteComment}>삭제</button>
            </>
          )}
        </div>
      {/* 답글 달기 버튼을 클릭하여 openReply=true가 되면 답글 작성, 등록 폼 제공 */}
      {openReply && 
          <form style ={{display: 'flex'}} onSubmit={onSubmit} >
          <textarea 
            style={{width: '100%', borderRadius: '5px'}}
            onChange={onHandleChange}
            value={commentValue}
            placeholder='답글을 작성해 보세요.'/>
          <br />
          <button style={{ width: '20%', height: '52px' }} onClick={onSubmit}>답글 등록</button>
        </form>}

      
    </div>
  );
}

export default SingleComment;