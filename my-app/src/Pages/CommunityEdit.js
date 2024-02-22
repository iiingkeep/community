import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

// 등록된 게시글 수정 컴포넌트
const CommunityEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 게시글 제목과 내용 상태 관리
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 서버의 다음 엔드포인트로 상세 게시글의 제목과 본문 데이터를 불러오기 위한 GET요청
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/Community/Edit/${id}`);
        setTitle(response.data.title);
        setContent(response.data.content);
      } catch (error) {
        console.error('게시물을 불러오는 중 에러 발생:', error);
      }
    };

    fetchPost();
  }, [id]);

  // 게시글 제목 업데이트
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  // 게시글 내용 업데이트
  const handleContentChange = (value) => {
    setContent(value);
  };


  // 등록버튼 클릭 시 호출되는 핸들러 함수
  const handlePostUpdate = async (e) => {
    // 등록버튼 클릭 시 게시글 수정 완료를 묻는 메시지창 출력
    // 확인 선택 시 서버의 다음 엔드포인트로 글의 제목과 내용 데이터 PUT 요청
    const editComfirmed = window.confirm("게시글 수정을 완료하시겠습니까?");
    if (editComfirmed) {
    e.preventDefault();

    try {
      const response = await axios.put(`http://localhost:8000/Community/Edit/${id}`, {
        title,
        content,
      });
      // 글 등록 완료 시 알림을 주고 게시글 상세 페이지로 이동
      if (response && response.status === 200) {
        console.log('글이 성공적으로 수정되었습니다.');
        alert('글이 성공적으로 수정되었습니다.');
        navigate(`/Community/Read/${id}`);
      } else { // 글 등록 실패 시 알림
        console.error('예상치 못한 응답:', response);
        alert('글 수정에 실패했습니다. 다시 한 번 시도해주세요.');
      } // 에러 발생 시 알림
    } catch (error) {
      console.error('에러 발생:', error);
      alert('글 수정에 실패했습니다. 다시 한 번 시도해주세요.');
    }
  }
  };

  // 취소 버튼 클릭 시 호출되는 핸들러
  const onCancelHandler = () => {
    // 취소 버튼 클릭 시 게시글 수정 취소를 묻는 메세지창 출력
    // 확인 선택 시 수정을 취소하고 게시글 상세페이지로 이동
    const cancelConfirm = window.confirm('수정을 취소하시겠습니까?')
    if (cancelConfirm) {
    navigate(`/Community/Read/${id}`)
    }
  }

  // quill editor의 module과 format 설정
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, false] }],
        ["bold","italic", "underline","strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        [{ align: [] }, { color: [] }, { background: [] }]
      ],
    },
  };
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "align",
    "color",
    "background",
  ];

  return (
    <div className='CommunityEdit'>
      <form onSubmit={handlePostUpdate}>
        {/* 제목 입력 input 설정 */}
        <div className='TitleBox'>
          <label htmlFor="PostTitle">제목</label>
          <input
            id='PostTitle'
            type='text'
            value={title}
            onChange={handleTitleChange}
          />
        </div>
        {/* 내용 입력을 위한 react-quill 에디터 설정 */}
        <div className='ContentBox'>
          <ReactQuill
            style={{ width: "800px", height: "400px", margin: "100px auto 50px" }}
            modules={modules}
            formats={formats}
            theme='snow'
            value={content}
            onChange={handleContentChange}
          />
          
        </div>
        <div className='ButtonBox'>
          <button type='submit'>등록</button>
          <button onClick={onCancelHandler}>취소</button>
        </div>
      </form>
    </div>
  );
};

export default CommunityEdit;