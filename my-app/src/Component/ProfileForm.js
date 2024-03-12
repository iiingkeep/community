// ProfileForm.js
import axios from "axios";
import { useEffect, useState } from "react";
import ImagePopup from "./ImagePopup";
import "../Styles/ProfileForm.css"
import { useImage } from "./ImageContext"; // context추가

const ProfileForm = ({userId}) => {
    // 회원 정보 상태관리
    const [profileData, setProfileData] = useState([]);
    // 이미지 URL 상태관리
    const { imageUrl, setImageUrl } = useImage(); // 수정후*
    // const [imageUrl, setImageUrl] = useState(""); // 수정전*
    
    // 이미지팝업창 클릭이벤트 상태관리
    const [showPopup, setShowPopup] = useState(false);

    

    // // 이미지 업데이트 핸들러
    const handleProfileImg = (url) => {
        setImageUrl(url);
    };
    // 이미지팝업창 클릭이벤트
    const handleImgPopup = () => {
        setShowPopup(true);
    };

    useEffect(() => {
        // 페이지 로드 시 저장된 이미지url 가져와서 상태에 설정
        const savedImageUrl = localStorage.getItem('storageImg');
        if (savedImageUrl) {
            setImageUrl(savedImageUrl);
        }

        // fetchProfile 함수를 useEffect 내부에서 정의하고 호출
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/my/profile/${userId}`);
                const userData = response.data[0]; // n번째 데이터
                setProfileData(userData);
                // console.log(userData)
            } catch (error) {
                console.error('Error: fetching profile data:', error);
            }
        };

        // fetchProfile 함수 호출
        // userId가 변경될 때마다 호출
        fetchProfile();
    }, [userId, setImageUrl]); // 오류 해결을 위해 setImageUrl 추가

    return (
        <div className="profile-form" >
            <h2>Profile Form</h2>
            {/* 업로드 된 이미지가 없다면 user_img폴더의 이미지를 표시 */}
            <div className="profileImg">
            {imageUrl ? ( <img src={imageUrl} alt="Profile" /> ) : ( <img src="/user_img/basic.png" alt="DefaultIMG" /> )}
            </div>
            <br />
            {/* 이미지 팝업 */}
            <button onClick={handleImgPopup}>사진 변경</button>
            {/* ImagePopup에 userId 전달 */}
            {showPopup && <ImagePopup userId={userId} onClose={() => setShowPopup(false)} handleProfileImg={handleProfileImg}/>}
            {/* 프로필 정보 */}
            {/* id식별 조건부 렌더링 */}
            {profileData.usertype === '2' || profileData.usertype === '3'  
                ? ( <p>사업자번호: {profileData.businessnumber}</p> ) : null}
            <p>회원이름: {profileData.username}</p>
            <p>핸드폰번호: {profileData.phonenumber}</p>
            <p>주소: {profileData.address}</p>
            <p>상세주소: {profileData.detailedaddress}</p>
            <p>이메일: {profileData.email}</p>
        </div>
    );
};
export default ProfileForm;

// // ProfileForm.js
// import axios from "axios";
// import { useEffect, useState } from "react";
// import ImagePopup from "./ImagePopup";
// import "../Styles/ProfileForm.css"

// const ProfileForm = ({userId}) => {
//     // 회원 정보 상태관리
//     const [profileData, setProfileData] = useState([]);
//     // 이미지 URL 상태관리
//     const [imageUrl, setImageUrl] = useState("");
//     // 이미지팝업창 클릭이벤트 상태관리
//     const [showPopup, setShowPopup] = useState(false);

    

//     // // 이미지 업데이트 핸들러
//     const handleProfileImg = (url) => {
//         setImageUrl(url);
//     };
//     // 이미지팝업창 클릭이벤트
//     const handleImgPopup = () => {
//         setShowPopup(true);
//     };

//     useEffect(() => {
//         // 페이지 로드 시 저장된 이미지url 가져와서 상태에 설정
//         const savedImageUrl = localStorage.getItem('storageImg');
//         if (savedImageUrl) {
//             setImageUrl(savedImageUrl);
//         }

//         // fetchProfile 함수를 useEffect 내부에서 정의하고 호출
//         const fetchProfile = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:8000/my/profile/${userId}`);
//                 const userData = response.data[0]; // n번째 데이터
//                 setProfileData(userData);
//                 // console.log(userData)
//             } catch (error) {
//                 console.error('Error: fetching profile data:', error);
//             }
//         };

//         // fetchProfile 함수 호출
//         fetchProfile();
//     }, [userId]); // userId가 변경될 때마다 호출

//     return (
//         <div className="profile-form" >
//             <h2>Profile Form</h2>
//             {/* 업로드 된 이미지가 없다면 user_img폴더의 이미지를 표시 */}
//             <div className="profileImg">
//             {imageUrl ? ( <img src={imageUrl} alt="Profile" /> ) : ( <img src="/user_img/basic.png" alt="DefaultIMG" /> )}
//             </div>
//             <br />
//             {/* 이미지 팝업 */}
//             <button onClick={handleImgPopup}>사진 변경</button>
//             {showPopup && <ImagePopup onClose={() => setShowPopup(false)} handleProfileImg={handleProfileImg}/>}
//             {/* 프로필 정보 */}
//             {/* id식별 조건부 렌더링 */}
//             {profileData.usertype === '2' || profileData.usertype === '3'  
//                 ? ( <p>사업자번호: {profileData.businessnumber}</p> ) : null}
//             <p>회원이름: {profileData.username}</p>
//             <p>핸드폰번호: {profileData.phonenumber}</p>
//             <p>주소: {profileData.address}</p>
//             <p>상세주소: {profileData.detailedaddress}</p>
//             <p>이메일: {profileData.email}</p>
//         </div>
//     );
// };
// export default ProfileForm;