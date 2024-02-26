import React, {useState,useEffect} from "react";
import SingleComment from "./SingleComment";


// 댓글에 달린 답글을 출력하는 컴포넌트
const ReplyComment = ({userid, refreshFunction, commentLists, parentCommentId, postId}) => {
  // 답글 갯수, 보기(펼침/접힘) 상태 관리
  const [childCommentNumber, setChildCommentNumber] = useState();
  const [openReplyComments, setOpenReplyComments] = useState();


  // 각 댓글에 달린 답글의 갯수를 계산, 업데이트
  // 전체 댓글 리스트에서 comment.responseTo값과 parentCommentId가 같은 답글은 그 답글의 갯수를 1씩 증가시켜 각각의 댓글에 몇개의 답글이 있는지 계산
  useEffect(() => {
    let commentNumber = 0;
    commentLists.map((comment) => {
      if(comment.responseTo === parentCommentId) {
        commentNumber ++
      }
    })
    setChildCommentNumber(commentNumber)
  }, [commentLists, parentCommentId])

  // 답글 렌더링 함수
  let renderReplyComment = (parentCommentId) => 
    commentLists.map((comment, index) => (
      <React.Fragment key={index}>
      { //전체 댓글 배열을 순회하며 답글이 있는 댓글의 경우 그 답글에 다시 답글을 달고 표시할 수 있도록 SingleComment와 ReplyComment 컴포넌트 렌더링
        comment.responseTo === parentCommentId &&
      <div style={{width: '80%', marginLeft: '40px'}}>
        <SingleComment userid={userid} refreshFunction={refreshFunction} comment={comment} postId={postId}/>
        <ReplyComment userid={userid} refreshFunction={refreshFunction} commentLists={commentLists} parentCommentId={comment.id} postId={postId}/>
        </div>
      }
      </React.Fragment>
    ))

    // 답글 보기를 클릭했을 때 접히고 펼쳐지는 상태를 업데이트 하는 함수
    const onHandleChange = () => {
      setOpenReplyComments(!openReplyComments)
    }

  return (
    <div className="ReplyComment">
      {/* 댓글에 대한 답글이 1개 이상일 경우 답글보기 버튼 표시 */}
      {childCommentNumber > 0 && 
      <p style={{ fontSize:'14px', margin: 0, color:'gray'}} onClick={onHandleChange}>
        답글 보기
      </p>
      }
      {/* 답글 보기 버튼을 클릭 해 openReplyComments가 true가 되면 renderReplyComment함수를 실행하여 답글 내용과 그 답글에 대한 답글 달기, 답글 보기 표시 */}
      {openReplyComments && 
        renderReplyComment(parentCommentId)
      }
      
    </div>
  )
}

export default ReplyComment;