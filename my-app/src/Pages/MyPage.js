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
  };

  return (
    <div className="MyForm">
      <h1>My Page</h1>
      <div className="MyBtn">
        <button onClick={() => handleFormChange('profile')}>프로필</button>
        <button onClick={() => handleFormChange('edit')}>정보수정</button>
        <button onClick={() => handleFormChange('activity')}>나의활동</button>
        <button onClick={() => handleFormChange('order')}>주문내역</button>
        <button onClick={() => handleFormChange('islike')}>좋아요</button>
      </div>
      {/* Form 조건부 렌더링 */}
      {activeForm === 'profile' && <ProfileForm formData={formData} userId={userData.userid} />}
      {activeForm === 'edit' && <EditForm formData={formData} userId={userData.userid} />}
      {activeForm === 'activity' && <ActivityForm formData={formData} userId={userData.userid} />}
      {activeForm === 'order' && <OrderForm formData={formData} userId={userData.userid} />}
      {activeForm === 'islike' && <IsLikeForm formData={formData} />}
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