// EditForm.js
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import DaumPostcode from "react-daum-postcode";
import { handlePostcode } from "../Pages/Postcodehandle";
import PasswordValid from "./PasswordValid";
import "../Styles/MyPage.css";

const EditForm = ({ userId }) => {
  const [profileData, setProfileData] = useState({});
  const [showEditForm, setShowEditForm] = useState(false);

  const [username, setUsername] = useState(""); // 이름
  const [password, setPassword] = useState(""); // 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인
  const [phonenumber, setPhonenumber] = useState(""); // 휴대폰 번호

  const [openPostcode, setOpenPostcode] = useState(false); // 주소
  const [address, setAddress] = useState(""); // 주소
  const [detailedaddress, setdetailedaddress] = useState(""); // 상세 주소

  const [usernameDuplication, setUsernameDuplication] = useState(false); // 닉네임 유효성
  const [phonenumberDuplication, setPhonenumberDuplication] = useState(false); // 휴대폰 번호 유효성

  const handle = handlePostcode(openPostcode, setOpenPostcode, setAddress);

  const setPasswordMatch = (match) => {
    // setPasswordMatch(true) 또는 setPasswordMatch(false) 등으로 사용
  };

  const spacebar = /\s/g; // 공백 정규표현식
  const special = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g; // 특수문자 정규표현식
  const NICKcheck = /^[가-힣a-zA-Z0-9]{4,10}$/;
  const PWcheck =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$%^&+=!])[a-zA-Z\d@#$%^&+=!]{8,16}$/; // PW 정규표현식
  const tel = /^010\d{8}$/; // 휴대폰 번호 정규표현식

  // 이전 username, phonenumber 상태를 저장할 변수
  const prevUsername = useRef(username);
  const prevPhonenumber = useRef(phonenumber);

  useEffect(() => {
    // username 상태가 변경될 때만 실행
    if (prevUsername.current !== username) {
      setUsernameDuplication(false); // setUsernameDuplication을 false로 설정
      prevUsername.current = username; // 이전 username 상태를 갱신
    }
  }, [username]); // username 상태가 변경될 때만 실행되도록 useEffect의 의존성 배열에 추가

  useEffect(() => {
    // phonenumber 상태가 변경될 때만 실행
    if (prevPhonenumber.current !== phonenumber) {
      setPhonenumberDuplication(false); // setPhonenumberDuplication을 false로 설정
      prevPhonenumber.current = phonenumber; // 이전 phonenumber 상태를 갱신
    }
  }, [phonenumber]); // phonenumber 상태가 변경될 때만 실행되도록 useEffect의 의존성 배열에 추가

  // 컴포넌트가 마운트될 때와 userId가 변경될 때마다 실행
  // axios를 사용하여 서버에서 해당 userId에 해당하는 사용자 프로필 데이터를 가져옵니다.
  // 가져온 데이터를 profileData 상태에 설정
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/my/edit/${userId}`
        );
        const userData = response.data[0];
        setProfileData(userData);
        // console.log(userData)
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfile();
  }, [userId]);

  // 닉네임 중복 검사
  const handleUsernameCheck = () => {
    if (!username) {
      alert("닉네임을 입력하세요.");
      return;
    } else if (username.match(spacebar)) {
      alert("닉네임에 공백을 포함할 수 없습니다.");
      return;
    } else if (username.match(special)) {
      alert("닉네임에 특수문자를 포함할 수 없습니다.");
      return;
    } else if (!NICKcheck.test(username)) {
      alert("닉네임 형식이 올바르지 않습니다.");
      return;
    } else {
      setUsernameDuplication(true);
    }

    axios
      .post("http://localhost:8000/checkUsernameDuplication", { username })
      .then((response) => {
        console.log("서버 응답:", response.data);
        setUsernameDuplication(response.data.success);
        alert(response.data.message);
      })
      .catch((error) => {
        console.error("닉네임 중복 확인 중 오류:", error);
        alert("client :: 닉네임 중복 확인 중 오류가 발생했습니다.");
      });
  };

  // 휴대폰 번호 중복 검사
  const handlePhonenumberCheck = () => {
    if (!phonenumber) {
      alert("휴대폰 번호를 입력하세요.");
      return;
    } else if (phonenumber.match(spacebar)) {
      alert("휴대폰 번호에 공백을 포함할 수 없습니다.");
      return;
    } else if (phonenumber.match(special)) {
      alert("휴대폰 번호에 특수문자를 포함할 수 없습니다.");
      return;
    } else if (!tel.test(phonenumber)) {
      alert("휴대폰 번호 형식이 올바르지 않습니다.");
      return;
    } else {
      setPhonenumberDuplication(true);
    }

    axios
      .post("http://localhost:8000/checkPhonenumberDuplication", {
        phonenumber,
      })
      .then((response) => {
        console.log("서버 응답:", response.data);
        setPhonenumberDuplication(response.data.success);
        alert(response.data.message);
      })
      .catch((error) => {
        console.error("휴대폰 번호 중복 확인 중 오류:", error);
        alert("client :: 휴대폰 번호 중복 확인 중 오류가 발생했습니다.");
      });
  };

  // 비밀번호 유효성 검사
  const handlePasswordValid = async (password) => {
    try {
      // 비밀번호 검사 요청을 서버에 보냅니다.
      const response = await axios.post(
        `http://localhost:8000/pw-valid/${userId}`,
        {
          userId: userId,
          password: password,
        }
      );
      // 검증이 성공하면 수정 양식을 표시합니다.
      setShowEditForm(response.data.isValid);
      const res = response.data.isValid;
      console.log(res);
    } catch (error) {
      console.error("Error validating password:", error);
    }
  };

  // input 필드의 값을 상태에 반영
  // input 요소의 변경 이벤트를 처리
  // name과 value를 추출하여 profileData 상태를 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  // 수정된 정보를 서버에 전송
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!usernameDuplication) {
        alert("닉네임 중복 확인을 해주세요.");
        return;
      } else if (!password) {
        alert("비밀번호를 입력하세요.");
        setPasswordMatch(false);
        return;
      } else if (password.match(spacebar)) {
        alert("비밀번호에 공백을 포함할 수 없습니다.");
        setPasswordMatch(false);
        return;
      } else if (!PWcheck.test(password)) {
        alert("비밀번호 형식이 올바르지 않습니다.");
        setPasswordMatch(false);
        return;
      } else if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        setPasswordMatch(false);
        return;
      } else if (!phonenumberDuplication) {
        alert("휴대폰 번호 중복 확인을 해주세요.");
        return;
      } else if (!address) {
        alert("주소를 입력하세요.");
        return;
      } else if (
        !username ||
        !password ||
        !confirmPassword ||
        !phonenumber ||
        !address ||
        !detailedaddress
      ) {
        alert("정보를 모두 입력하세요.");
        return;
      } else {
        //변경된 정보만 추출
        const updatedData = {
          username: username,
          password: password,
          confirmPassword: confirmPassword,
          phonenumber: phonenumber,
          address: address,
          detailedaddress: detailedaddress,
        };
        try {await axios.put(
        `http://localhost:8000/my/edit/update/${userId}`,
        profileData
            , (res, result) => {
            console.log(updatedData);
        });
           
          }
        catch (error) {
            console.error('clinet error',error)
        }
        alert("성공적으로 수정되었습니다.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="edit-form">
      <table>
        <thead>
          <tr>
            <th className="my-form__title">
              <p className="my-form__text">정보수정</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {!showEditForm ? (
            <tr>
              <td>
                <PasswordValid onPasswordValid={handlePasswordValid} />
              </td>
            </tr>
          ) : (
            <tr>
              <td className="edit-form__content">
                {/* <td className="edit-form__content"> */}
                <tr>
                  <td>
                    <label className="edit-form__label">
                      <span className="edit-form__text">아이디</span>
                      <input
                        className="edit-form__input"
                        type="text"
                        name="email"
                        value={profileData.email}
                        placeholder={profileData.email}
                        disabled
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="edit-form">
                      <span className="edit-form__text">닉네임</span>
                      <input
                        className="edit-form__input"
                        type="text"
                        name="username"
                        value={username}
                        placeholder={profileData.username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <button
                        className="edit-form__btn"
                        onClick={handleUsernameCheck}
                      >
                        중복 확인
                      </button>
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="edit-form__label">
                      <span className="edit-form__text">수정할 비밀번호</span>
                      <input
                        className="edit-form__input"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="edit-form__label">
                      <span className="edit-form__text">
                        수정할 비밀번호 재입력
                      </span>
                      <input
                        className="edit-form__input"
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </label>
                  </td>
                </tr>
                <p className="edit-form-match__text">닉네임 유효성</p>
                <tr>
                  <td>
                    <label className="edit-form__label">
                      <span className="edit-form__text">휴대폰 번호</span>
                      <input
                        className="edit-form__input"
                        type="text"
                        name="phonenumber"
                        value={phonenumber}
                        placeholder={profileData.phonenumber}
                        onChange={(e) => setPhonenumber(e.target.value)}
                      />
                      <button
                        className="edit-form__btn"
                        onClick={handlePhonenumberCheck}
                      >
                        중복 확인
                      </button>
                    </label>
                  </td>
                </tr>
                <p className="edit-form-match__text">휴대폰 번호 유효성</p>
                <tr>
                  <td>
                    <label className="edit-form__label">
                      <span className="edit-form__text">주소</span>
                      <input
                        className="edit-form__input"
                        type="text"
                        name="address"
                        value={address}
                        placeholder={profileData.address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                      <button
                        type="button"
                        className="edit-form__btn"
                        onClick={handle.clickButton}
                      >
                        주소 선택
                      </button>
                    </label>
                    {openPostcode && (
                      <DaumPostcode
                        onComplete={handle.selectAddress}
                        autoClose={false}
                        defaultQuery=""
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="edit-form__label">
                      <span className="edit-form__text">상세주소</span>
                      <input
                        className="edit-form__input"
                        type="text"
                        name="detailedaddress"
                        value={detailedaddress}
                        placeholder={profileData.detailedaddress}
                        onChange={(e) => setdetailedaddress(e.target.value)}
                      />
                    </label>
                  </td>
                </tr>
                <div className="edit-form-wrapper__btn">
                  <button
                    className="edit-form__btn"
                    onClick={handleEditSubmit}
                    onSubmit={handleEditSubmit}
                  >
                    수정완료
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EditForm;
