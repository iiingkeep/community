import { Link } from "react-router-dom";
import React, { useState } from "react";
import DaumPostcode from "react-daum-postcode";
import { handlePostcode } from "./Postcodehandle";
import axios from "axios";
import "../Styles/RegisterPersonal.css";

function RegisterPersonal() {
  const [username, setUsername] = useState(""); // 이름
  const [email, setEmail] = useState(""); // 아이디
  const [password, setPassword] = useState(""); // 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인
  const [openPostcode, setOpenPostcode] = useState(false); // 주소
  const [address, setAddress] = useState(""); // 주소
  const [detailedaddress, setdetailedaddress] = useState(""); // 상세 주소
  const [phonenumber, setphonenumber] = useState(""); // 휴대폰 번호
  const [emailDuplication, setEmailDuplication] = useState(false); // 아이디 유효성

  const handle = handlePostcode(openPostcode, setOpenPostcode, setAddress);

  const setPasswordMatch = (match) => {
    // setPasswordMatch(true) 또는 setPasswordMatch(false) 등으로 사용
  };

  const spacebar = /\s/g; // 공백 정규표현식
  const special = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g; // 특수문자 정규표현식
  const IDcheck = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{5,20}$/; // ID 정규표현식
  const NICKcheck = /^[가-힣a-zA-Z0-9]{4,10}$/;
  const PWcheck = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,16}$/; // PW 정규표현식
  const tel = /^010\d{8}$/; // 휴대폰 번호 정규표현식

  // 아이디 유효성 검사
  const handleEmailDuplicationCheck = () => {
    if (!email) {
      alert("아이디를 입력하세요.");
      return;
    } else if (email.match(spacebar)) {
      alert("아이디에 공백을 포함할 수 없습니다.");
      return;
    } else if (email.match(special)) {
      alert("아이디에 특수문자를 포함할 수 없습니다.");
      return;
    } else if (!IDcheck.test(email)) {
      alert("아이디 형식이 올바르지 않습니다.");
      return;
    } else {
      setEmailDuplication(true);
    }

    // 클라이언트가 서버에 아이디 중복 확인을 요청
    axios
      .post("http://localhost:8000/checkEmailDuplication", { email })
      .then((response) => {
        console.log("서버 응답:", response.data);
        setEmailDuplication(response.data.success);
        alert(response.data.message);
      })
      .catch((error) => {
        console.error("아이디 중복 확인 중 오류:", error);
        alert("client :: 아이디 중복 확인 중 오류가 발생했습니다.");
      });
  };

  const handleRegisterClick = () => {
    if (!email) {
      alert("아이디를 입력해주세요!");
      return;
    }
    if (!emailDuplication) {
      alert("아이디 중복확인을 해주세요.");
      return;
    }
    if (!NICKcheck.test(username)) {
      alert("닉네임 형식이 올바르지 않습니다.");
      return;
    }
    if (!PWcheck.test(password)) {
      alert("비밀번호 형식이 올바르지 않습니다.");
      return;
    }
    if (password.match(spacebar)) {
      alert("비밀번호에 공백을 포함할 수 없습니다.");
      return;
    }
    // if (password.match(PWcheck) && !spacebar.test(password)) {
      
    // }
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      setPasswordMatch(false);
      return;
    }
    if (!tel.test(phonenumber)) {
      alert("휴대폰 번호 형식이 올바르지 않습니다.");
      return;
    }
    if (
      !email ||
      !username ||
      !password ||
      !confirmPassword ||
      !phonenumber ||
      !address ||
      !detailedaddress
    ) {
      alert("정보를 모두 입력해주세요");
      return;
    }

    // 클라이언트에서 서버로 회원가입 요청
    axios
      .post("http://localhost:8000/register", {
        username,
        password,
        email,
        address,
        detailedaddress,
        phonenumber,
        usertype: "personal",
      })
      .then((response) => {
        console.log("서버 응답:", response.data);
        alert("회원가입이 완료되었습니다.");
        if (response.data.userType === 1) {
          // 개인 사용자 처리
        }
        window.location.href = "/Login"; // 홈 페이지 또는 다른 페이지로 리디렉션
      })
      .catch((error) => {
        if (error.response) {
          // 서버가 응답한 상태 코드가 2xx가 아닌 경우
          console.error(
            "서버 응답 오류:",
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          // 서버로 요청이 전송되었지만 응답이 없는 경우
          console.error("서버 응답이 없음:", error.request);
        } else {
          // 요청을 설정하는 중에 에러가 발생한 경우
          console.error("요청 설정 중 오류:", error.message);
        }
        alert("서버와의 통신 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="regi-page">
      <div className="regi-form">
        <h2>회원가입</h2>
        <input
          type="text"
          placeholder="ID : 영문·숫자로만 5~20 자리"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* 아이디 유효성 검사 */}
        <button
          className="regi-email__button"
          onClick={handleEmailDuplicationCheck}
        >
          아이디 중복확인
        </button>
        <br />
        <input
          type="text"
          placeholder="NICKNAME : 한글·영문·숫자로만 4~10 자리"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="PW : 영문·숫자·특수문자 섞어서 8~16 자리"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p style={{ fontSize: 12, color: "gray" }}>
          사용 가능한 특수문자 : @#$%^&+=!
        </p>
        <br />
        <input
          type="password"
          placeholder="PW 재입력"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {/* 비밀번호 일치 여부 확인 */}
        {password && confirmPassword && (
          <p>
            {password === confirmPassword
              ? "비밀번호가 일치합니다."
              : "비밀번호가 일치하지 않습니다."}
          </p>
        )}
        <br />
        <input
          type="text"
          placeholder="휴대폰 번호를 입력하세요."
          value={phonenumber}
          onChange={(e) => setphonenumber(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="주소를 입력하세요."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button
          type="button"
          className="regi-addr__button"
          onClick={handle.clickButton}
        >
          주소 선택
        </button>
        {openPostcode && (
          <DaumPostcode
            onComplete={handle.selectAddress}
            autoClose={false}
            defaultQuery=""
          />
        )}
        <br />
        <input
          type="text"
          placeholder="상세 주소를 입력하세요."
          value={detailedaddress}
          onChange={(e) => setdetailedaddress(e.target.value)}
        />
        <br />
        <button className="regi-complete__button" onClick={handleRegisterClick}>
          가입완료
        </button>
        <div className="regi-button__to-login">
          <Link to="/Login">로그인창</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPersonal;
