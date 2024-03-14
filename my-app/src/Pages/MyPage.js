// MyPage.js
import { useEffect, useState } from "react";
import ProfileForm from "../Component/ProfileForm";
import EditForm from '../Component/EditForm';
import ActivityForm from '../Component/ActivityForm';
import OrderForm from "../Component/OrderForm";
import IsLikeForm from "../Component/IsLikeForm";
import axios from "axios";
import "../Styles/MyPage.css";

const MyPage = () => {
  const [activeForm, setActiveForm] = useState('profile');
  const [formData, setFormData] = useState({});
  const [selectedButton, setSelectedButton] = useState('profile');

   const storedUserData = sessionStorage.getItem("userData");
   const userData = JSON.parse(storedUserData);
  //  console.log("세션확인:",userData)

  useEffect(() => {
    const fetchData = async (formType) => {
      try {
        const storedUserData = sessionStorage.getItem("userData");
        const userData = JSON.parse(storedUserData);
        const response = await axios.get(`http://localhost:8000/my/${formType}/${userData.userid}`);

        // 반환된 데이터가 배열 안에 객체이므로 첫 번째 요소를 선택
        if (response.data.length > 0) {
          // 응답 데이터 형식은 배열 안에 객체의 형태
          // response.data는 배열이며, 실제 데이터는 배열의 첫 번째 요소인 객체에 들어 있다 
          setFormData(response.data[0]); // 첫 번째 요소에 해당하는 객체를 상태로 설정
        } else {
          console.log("User data not found");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData(activeForm);
  }, [activeForm]);

  // 폼 선택 핸들러
  const handleFormChange = (formType) => {
    setActiveForm(formType);
    setSelectedButton(formType);
  };

  return (
    <div className="my-page inner">
      <div className='com-header'><h1 className='com-header__title'>마이페이지<p className='com-header__title--detail'>내가 남긴 발자국은 어떤 모양일까?<br />
      나의 탄소중립 활동으로 확인해요. 발자국이 많을 수록 탄소중립에 한 발 더 가까이!</p></h1>
        <img className="com-header__img" src='background_img/thumb1.png' />
      </div>
      <div className="my-page__wrapper">
        <div className="my-page__btn">
          <ul>
          <li><button className={`my-btn__button ${selectedButton === 'profile' ? 'active' : ''}`} onClick={() => handleFormChange('profile')}>프로필</button></li>
          <li><button className={`my-btn__button ${selectedButton === 'edit' ? 'active' : ''}`} onClick={() => handleFormChange('edit')}>정보수정</button></li>
          <li><button className={`my-btn__button ${selectedButton === 'activity' ? 'active' : ''}`} onClick={() => handleFormChange('activity')}>나의활동</button></li>
          {/* <button className={`my-btn__button ${selectedButton === 'order' ? 'active' : ''}`} onClick={() => handleFormChange('order')}>주문내역</button> */}
          <li><button className={`my-btn__button ${selectedButton === 'islike' ? 'active' : ''}`} onClick={() => handleFormChange('islike')}>좋아요</button></li>
          </ul>
        </div>
      {/* Form 조건부 렌더링 */}
        <div className="my-page__right">
        {activeForm === 'profile' && <ProfileForm formData={formData} userId={userData.userid} />}
        {/* {activeForm === 'profile' && <ProfileForm formData={formData} userId={userData.userid} />} */}
        {activeForm === 'edit' && <EditForm formData={formData} userId={userData.userid} />}
        {activeForm === 'activity' && <ActivityForm formData={formData} userId={userData.userid} />}
        {activeForm === 'order' && <OrderForm formData={formData} userId={userData.userid} />}
        {activeForm === 'islike' && <IsLikeForm formData={formData} />}
        </div>
      </div>
      <div>
      </div>
    </div>
  );
};

export default MyPage;

// const MyPage = () => {
//   return (
//     <div className='MyPage'>
//       마이페이지
//       <div>
//         <button>포인트</button>
//         <button>개인정보 수정</button>
//         <button>나의 활동내역</button>
//       </div>
//     </div>
//   )
// }

// export default MyPage;