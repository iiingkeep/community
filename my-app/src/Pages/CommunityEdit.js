import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill, {Quill} from "react-quill";
import 'react-quill/dist/quill.snow.css';
import ImageResize from "quill-image-resize-module-react";
import {ImageDrop} from 'quill-image-drop-module'

// 등록된 게시글 수정 컴포넌트
const CommunityEdit = ({userid}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 게시글 제목과 내용 상태 관리
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(1);

  const quillRef = useRef(null);

  // 서버의 다음 엔드포인트로 상세 게시글의 제목과 본문 데이터를 불러오기 위한 GET요청
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/Community/Edit/${id}`);
        setTitle(response.data.title);
        setContent(response.data.content);
        setSelectedCategory(response.data.categoryid);
      } catch (error) {
        console.error('게시물을 불러오는 중 에러 발생:', error);
      }
    };
    fetchPost();
  }, [id]);
  console.log('콘텐트',content);

  // 게시글 제목 업데이트
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  // 게시글 내용 업데이트
  const handleContentChange = (value) => {
    setContent(value);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // quill-editor 사용 시 이미지가 base64 형태로 저장되어 DB에 데이터가 들어가지 않는 현상 방지를 위한 이미지 처리 핸들러
 // 따로 생성한 input에서 이미지를 받아 서버로 보내면 서버에서 이미지 src를 url로 변환 후 그 값을 받아와 에디터에 이미지가 나타나게끔 설정
 const imageHandler = () => {

  console.log('에디터에서 이미지 버튼을 클릭하면 이 핸들러가 시작됩니다!');

  // 이미지를 저장할 input type=file DOM을 만든다.
  const input = document.createElement('input');
  // input의 속성 지정
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  // 에디터의 이미지버튼 클릭 시 이 input이 클릭되도록 설정.
  // input이 클릭되면 파일 선택창 표시
  input.click(); 

  // input요소 값이 변할 경우(이미지를 선택했을 때) 이벤트 헨들러 함수 호출
  input.addEventListener('change', async () => {
    // 선택한 파일 중 첫 번째 파일 할당
    const file = input.files[0];
    // multer에 맞는 형식으로 데이터 생성
    // formData는 key-value구조로, key는 img, value는 선택된 파일로 설정하여 추가
    const formData = new FormData();
    formData.append('img', file); 

    // 서버의 다음 엔드포인트에 이미지 데이터를 보내기 위한 POST 요청
    try {
      const result = await axios.post('http://localhost:8000/img', formData);
      console.log('성공 시, 백엔드가 보내주는 데이터', result.data.url);
      // const {width, height} = result.data;
      // 서버로부터 받은 이미지url 데이터를 IMG_URL에 할당
      // 이 url을 img 태그의 src에 넣어 에디터의 커서에 삽입 시 에디터 내 이미지 출력
      const IMG_URL = result.data.url;

      // 에디터에 이미지 태그 넣기
      // useRef를 이용해 에디터 객체 선택
      const editor = quillRef.current.getEditor();
      // 현재 에디터 커서 위치값 가져오기
      const range = editor.getSelection();
      // 가져온 위치에 이미지를 삽입
      editor.insertEmbed(range.index, 'image', IMG_URL, );
    } catch (error) { //에러 발생 시 알림
      console.log('failed');
    }
  });
};


  // 등록버튼 클릭 시 호출되는 핸들러 함수
  const handlePostUpdate = async (e) => {
    e.preventDefault();
    // 등록버튼 클릭 시 게시글 수정 완료를 묻는 메시지창 출력
    // 확인 선택 시 서버의 다음 엔드포인트로 글의 제목과 내용 데이터 PUT 요청
    const editComfirmed = window.confirm("게시글 수정을 완료하시겠습니까?");
    if (editComfirmed) {

    try {
      const response = await axios.put(`http://localhost:8000/Community/Edit/${id}`, {
        userid,
        categoryid: selectedCategory,
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
  const onCancelHandler = (e) => {
    e.preventDefault();
    // 취소 버튼 클릭 시 게시글 수정 취소를 묻는 메세지창 출력
    // 확인 선택 시 수정을 취소하고 게시글 상세페이지로 이동
    const cancelConfirm = window.confirm('수정을 취소하시겠습니까?')
    if (cancelConfirm) {
    navigate(`/Community/Read/${id}`)
    }
  }

  // quill 에디터 이용을 위한 modules와 formats 설정
  // modules: 에디터의 여러 기능 활성화 또는 비활성화
  // formats: 텍스트 스타일링과 형식 정의
  Quill.register("modules/imageResize", ImageResize);
  // modules설정. toolbar와 imageResize 모듈 사용.
  //useMemo를 이용해 이전 값을 기억해 성능 최적화.
  const modules = useMemo(() => {
    return {
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
      handlers : {image: imageHandler,},
    },
    // 이미지 크기를 조절하기 위한 모듈
    // parchment를 import하여 imageRiseze모듈이 이미지 처리하는 방식 지정
    imageResize: {
      parchment: Quill.import("parchment"),
      // imageResize module의 구성
      // Resize: 이미지 선택시 크기 조절 핸들이 나타나 크기 조절 가능
      // DisplaySize: 이미지 선택시 이미지의 현재 크기 표시
      // Toolbar: 툴바에 이미지 리사이즈 관련 버튼 생성
      modules: [
        "Resize", "DisplaySize"],
    },
    
  };
  },[]);
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
    <div className='commu-edit-page inner'>
      {/* 커뮤니티 헤더 */}
      <h1 className='commu-header'>커뮤니티</h1>
      {/* 게시글 카테고리 탭 */}
      <div className='commu-category-box commu-write__category-box'>
        <button className={'commu-category__button' + (selectedCategory === 1 ? ' commu-category__button--selected' : '')} onClick={() => handleCategoryClick(1)}>실천기록</button>
        <button className={'commu-category__button' + (selectedCategory === 2 ? ' commu-category__button--selected' : '')} onClick={() => handleCategoryClick(2)}>자유게시판</button>
        <button className={'commu-category__button' + (selectedCategory === 3 ? ' commu-category__button--selected' : '')} onClick={() => handleCategoryClick(3)}>고민과질문</button>
      </div>
      {/* 글 수정을 위한 폼 */}
      <form onSubmit={handlePostUpdate}>
        {/* 제목 입력 input 설정 */}
        <div className='commu-write__title-box'>
          <input
            id='post_title'
            className="commu-write__title"
            type='text'
            value={title}
            onChange={handleTitleChange}
          />
        </div>
        {/* 내용 입력을 위한 react-quill 에디터 설정 */}
        <div className='commu-write__content-box'>
        <ReactQuill 
        ref={quillRef}
        className="commu-write__content"
        modules={modules}
        formats={formats}
        theme='snow'
        value={content}
        onChange={handleContentChange}/>
      </div>
        <div className='commu-write__button'>
          <button type='submit' className='commu-write__button--submit button' >등록</button>
          <button className="commu-write__button--cancel button" onClick={onCancelHandler}>취소</button>
        </div>
      </form>
    </div>
  );
};

export default CommunityEdit;