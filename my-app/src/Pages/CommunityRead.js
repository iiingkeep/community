import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from 'react-router-dom';
import Comment from './Comment';

// 게시글 상세와 댓글을 출력하는 컴포넌트
const CommunityRead = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState();


  useEffect(() => {
    // 서버의 다음 엔드포인트로 상세 게시글 데이터를 불러오기 위한 GET요청
    // 불러온 데이터는 post에 업데이트.
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/Community/Read/${id}`);
        console.log(response.data);
        setPost(response.data);
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
      } catch (error) {
        console.error('댓글을 불러오는 중 에러 발생:', error);
      }
    };
    fetchComments();
  }, [id]);
  
  // 등록한 댓글이 전에 있던 댓글 다음으로 바로 출력되어 나오도록 하는 함수 생성
  const refreshFunction = (newComment) => {
    setComments(comments.concat(newComment))
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
 

  return (
    <div className='CommunityRead'>
      <h1>{post.title}</h1>
      <p>{post.createdAt}</p>
      {/* quill editor의 HTML태그 사용을 위한 설정. 리액트는 보안 이슈로 인해 HTML태그의 직접적인 사용을 제한하기 때문에 HTML태그 사용을 선언하는대신 DOMPurify를 사용해 보안 강화*/}
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}></div>
      {/* ***글 작성자 본인만 게시글 수정, 삭제 버튼 보이도록 설정해야함*** */}
      <button onClick={() => navigate(`/Community/Edit/${id}`)}>수정</button>
      <button onClick={onDeleteHandler}>삭제</button>
      {/* 댓글 표시를 위한 Comment 컴포넌트 렌더링 */}
      <div className='CommentBox'>
        <Comment refreshFunction={refreshFunction} commentLists={comments} post={post}/>
      </div>
      {/* 게시글 간 이동이 편하도록 버튼 구성 */}
      <div>
        <button>이전글</button>
        <button>다음글</button>
        <button>목록</button>
      </div>
    </div>
  )
}

export default CommunityRead;