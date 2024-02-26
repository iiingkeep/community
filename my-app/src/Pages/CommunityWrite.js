import ReactQuill, {Quill} from "react-quill";
import 'react-quill/dist/quill.snow.css';
import ImageResize from "quill-image-resize-module-react";
import React, {useState, useRef, useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CommunityWrite.css'

// 게시글 작성 컴포넌트
const CommunityWrite = ({userid}) => {
  const navigate = useNavigate();
  // 게시글 제목과 내용 상태 관리
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(1);
  const quillRef = useRef(null);
  
  // 게시글 제목(title)값 업데이트
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  // 게시글 내용(content)값 업데이트
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

      // 서버로부터 받은 이미지url 데이터를 IMG_URL에 할당
      // 이 url을 img 태그의 src에 넣어 에디터의 커서에 삽입 시 에디터 내 이미지 출력
      const IMG_URL = result.data.url;

      // 에디터에 이미지 태그 넣기
      // useRef를 이용해 에디터 객체 선택
      const editor = quillRef.current.getEditor();
      // 현재 에디터 커서 위치값 가져오기
      const range = editor.getSelection();
      // 가져온 위치에 이미지를 삽입
      editor.insertEmbed(range.index, 'image', IMG_URL);
    } catch (error) { //에러 발생 시 알림
      console.log('failed');
    }
  });
};

  // 글 작성 후 등록 버튼 클릭 시 호출되는 헨들러 함수
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const view = 0;
    // 제목 또는 내용이 입력되어 있지 않은 경우 유저에게 알리고 입력하도록 포커스
    try {
      if (!title||!content) {
      if (!title) {
        alert('제목을 입력해주세요.');
          document.getElementById('PostTitle').focus();
          return;}
      else if(!content) {
          alert('내용을 입력해주세요.');
          document.querySelector('.ql-editor').focus();
          return;
        }
      } else {
      // 제목과 내용 작성을 완료했을 경우 서버의 다음 엔드포인트로 새 게시글 정보(제목, 내용) POST 요청
      const response = await axios.post('http://localhost:8000/Community/Write', {
        userid,
        categoryid: selectedCategory,
        title,
        content,
        view: view
      });
      console.log(response.status);
      console.log(response.data);

      // 게시글 등록 성공 시 알림
      if (response&&response.status === 201) {
        console.log('글이 성공적으로 등록되었습니다.');
        alert('글이 성공적으로 등록되었습니다.')
        navigate('/Community');
      } else { // 게시글 등록 실패 시 알림
        console.error('예상치 못한 응답:', response);
        alert('글 등록에 실패했습니다. 다시 한 번 시도해주세요.')
      }}
    } catch (error) { // 에러 발생 시 알림
      console.error('에러 발생:', error);
      alert('글 작성에 실패했습니다. 다시 한 번 시도해주세요.')
    }
  };

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
        "Resize", "DisplaySize", "Toolbar"],
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
    <div className='CommunityWrite'>
      <div className='CategoryBox'>
        <button className={selectedCategory === 1 ? 'selected' : ''} onClick={() => handleCategoryClick(1)}>실천기록</button>
        <button className={selectedCategory === 2 ? 'selected' : ''} onClick={() => handleCategoryClick(2)}>자유게시판</button>
        <button className={selectedCategory === 3 ? 'selected' : ''} onClick={() => handleCategoryClick(3)}>고민과질문</button>
      </div>
      {/* 글 작성을 위한 폼 */}
      <form onSubmit={handlePostSubmit}>
      <div className='TitleBox'>
        {/* <label htmlFor="PostTitle">제목</label> */}
        <input
            id='PostTitle'
            type='text'
            value={title}
            onChange={handleTitleChange}
            placeholder="제목을 입력해 주세요"
          />
      </div>
      {/* 본문 작성을 위한 quill-editor 설정 */}
      <div className='ContentBox'>
        <ReactQuill 
        ref={quillRef}
        style={{width: "800px", height: "400px", margin: "50px auto 50px"}}
        modules={modules}
        formats={formats}
        theme='snow'
        value={content}
        onChange={handleContentChange}/>
      </div>
      {/* 게시물 등록/취소 버튼 */}
      <div className='ButtonBox'>
        <button type='submit'>등록</button>
        <button>취소</button>
      </div>
      </form>
    </div>
  )
}



export default CommunityWrite;