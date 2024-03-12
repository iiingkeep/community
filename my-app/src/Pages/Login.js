import React, { useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../Styles/Login.css"

//로그인 페이지 상태 변화 함수
function Login() {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loginStatus,setloginStatus]= useState('');
  // const [userTypes, setUserTypes] = useState([]);

  //어떤 체크박스가 클릭이 됬는지 확인 해주는 함수
  // const handleCheckboxChange = (type) => {
  //   setUserTypes(type);
  // };
  
  const LoginPageJs = () => {
    console.log('LoginPageJs 함수 호출됨');//스크립트 동작시 콘솔에 출력
  
    // 로그인 요청 구현
    axios.post('http://localhost:8000/Login', {
      email: email,
      password: password
    })//회원 정보 email, password, usertype의 정보를 가져옴
    .then(response => {
      console.log('서버 응답:', response);
      if (response.data.success) {
        const { userid, username } = response.data.data[0]; //0213 김민호 익스플로우세션
        const userData={
          userid: userid,
          username: username
        }
        sessionStorage.setItem('loggedIn', true);
        sessionStorage.setItem('userData',JSON.stringify(userData) ); // 0210 상호형 추가 세션에 userNumber,username추가
        // sessionStorage.setItem('usertype', usertype);//익스플로우 세션 데이터 추가 0213 김민호
        //Application에 세션스토리지 안에서 정보를 출력한다
  
        navigate('/');
        window.location.reload(); //0210 상호형 추가 페이지를강제로 리로드
      } else {
        // 로그인 실패 시 처리
        console.log('로그인 실패:', response.data);
        setloginStatus('로그인 실패: '+ response.data.message);
      }
    })
  };
  
  return (
    <div className="login-page">
      <div className="login-box">
        <form className="login-form">
          {/* 로그인 아이디 비밀번호 표시 */}
          {/* <p>아이디</p> */}
          <input
            id="id"
            type="text"
            placeholder="아이디를 입력해주세요."
            value={email}
            onChange={(e) => setemail(e.target.value)}
          />
          <br />
          {/* <p>비밀번호</p> */}
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />

          {/* 체크박스 표시  */}
          {/* <div>
          <input
              type="checkbox"
              id="personalCheckbox"
              checked={userTypes===1}
              onChange={() => handleCheckboxChange(1)}
            />
            <label htmlFor="personalCheckbox">개인</label>

            <input
              type="checkbox"
              id="businessCheckbox"
              checked={userTypes===2}
              onChange={() => handleCheckboxChange(2)}
            />
            <label htmlFor="businessCheckbox">기업</label>

            <input
              type="checkbox"
              id="organizationCheckbox"
              checked={userTypes===3}
              onChange={() => handleCheckboxChange(3)}
            />
            <label htmlFor="organizationCheckbox">단체</label>
          </div> */}
          {/* 로그인 버튼 표시 */}
          <button
            className="login-form__button"
            onClick={(e) => {
              e.preventDefault();
              console.log("버튼 클릭됨");
              LoginPageJs();
            }}
          >
            로그인
          </button>
          <div className="login-page__to-register">
            <Link to="/RegisterPersonal">회원이 아니신가요?</Link>
          </div>
          {loginStatus && <div>{loginStatus}</div>}
        </form>
      </div>
    </div>
  );
}

export default Login;