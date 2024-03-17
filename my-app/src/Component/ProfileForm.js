// ProfileForm.js
import axios from "axios";
import { useEffect, useState } from "react";
import ImagePopup from "./ImagePopup";
import "../Styles/MyPage.css";
import { Icon } from '@iconify/react';


const ProfileForm = ({ userId }) => {
    // 회원 정보 상태관리
    const [profileData, setProfileData] = useState([]);
    // 이미지 URL 상태관리
    const [imageUrl, setImageUrl] = useState("");
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
        fetchProfile();
    }, [userId]); // userId가 변경될 때마다 호출

    return (
        <div className="profile-form" >
            <div className="my-form__title">
                <p className="my-form__text">나의 프로필</p>
            </div>

            <div className="profile-form__wrapper">
                <div className="profile-form__img">
                    {/* 업로드 된 이미지가 없다면 user_img폴더의 이미지를 표시 */}
                    {imageUrl ? (<img src={imageUrl} alt="userimg" />)
                        : (<img className="profile-form__img" src="/user_img/basic.png" alt="IMG" />)}
                    <button className="profile__btn" onClick={handleImgPopup}><Icon className="profile__btn__icon" icon="mdi:photo-camera" /></button>
                </div>
            </div>

            {/* 이미지 팝업 */} {/* ImagePopup에 userId 전달 */}
            {showPopup && <ImagePopup userId={userId} onClose={() => setShowPopup(false)} handleProfileImg={handleProfileImg} />}

            {/* id식별 조건부 렌더링 */}
            {profileData.usertype === '2' || profileData.usertype === '3'
                ? (<p>사업자번호 {profileData.businessnumber}</p>) : null}
            <div className="profile-name-wrapper">
                <span className="profile__username">{profileData.username}</span>
                <span className="profile__sir">님</span>
            </div>

            <div class="profile-content__detail">
                <table>
                    <tr>
                        <td>아이디</td>
                        <td>{profileData.email}</td>
                    </tr>
                    <tr>
                        <td>휴대전화</td>
                        <td>{profileData.phonenumber && 
                            profileData.phonenumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</td>
                    </tr>
                    <tr>
                        <td>주소</td>
                        <td>{profileData.address}</td>
                    </tr>
                    <tr>
                        <td>상세주소</td>
                        <td>{profileData.detailedaddress}</td>
                    </tr>
                </table>
            </div>
        </div>
    );
};
export default ProfileForm;

// // ProfileForm.js
// import axios from "axios";
// import { useEffect, useState } from "react";
// import ImagePopup from "./ImagePopup";
// import "../Styles/MyPage.css";
// import { useImage } from "./ImageContext"; // context추가

// const ProfileForm = ({userId}) => {
//     // 회원 정보 상태관리
//     const [profileData, setProfileData] = useState([]);
//     // 이미지 URL 상태관리
//     const { imageUrl, setImageUrl } = useImage(); // 수정후*
//     // const [imageUrl, setImageUrl] = useState(""); // 수정전*

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
//         // userId가 변경될 때마다 호출
//         fetchProfile();
//     }, [userId, setImageUrl]); // 오류 해결을 위해 setImageUrl 추가

//     return (
//         <div className="profile-form inner" >
//             <div className="my-form__title">
//                 <p className="my-form__text">나의 프로필</p>
//             </div>

//             <div className="my-form__wrapper">
//                 <div className="profile-form__img">
//                     {/* 업로드 된 이미지가 없다면 user_img폴더의 이미지를 표시 */}
//                     {imageUrl ? (<img src={imageUrl} alt="userimg" />) 
//                     : (<img className="profile-form__img" src="/user_img/basic.png" alt="IMG" />)}
//                     </div>
//                     <div className="profile-wrapper__btn">
//                     <button className="profile__btn" onClick={handleImgPopup}>사진 변경</button>
//                 </div>

//                 <div className="profile-content">
//                     {/* 이미지 팝업 */}
//                     {/* ImagePopup에 userId 전달 */}
//                     {showPopup && <ImagePopup userId={userId} onClose={() => setShowPopup(false)} handleProfileImg={handleProfileImg} />}

//                     <div className="profile-content-wrapper">
//                         {/* id식별 조건부 렌더링 */}
//                         {profileData.usertype === '2' || profileData.usertype === '3'
//                             ? (<p>사업자번호 {profileData.businessnumber}</p>) : null}

//                         <div className="profile-name-wrapper">
//                             <span className="profile__name">{profileData.username}</span>
//                             <span> 님</span>
//                         </div>
//                         <table class="profile-content__detail">
//                             <tr>
//                                 <td>이메일</td>
//                                 <td>{profileData.email}</td>
//                             </tr>
//                             <tr>
//                                 <td>휴대전화</td>
//                                 <td>{profileData.phonenumber}</td>
//                             </tr>
//                             <tr>
//                                 <td>주소</td>
//                                 <td>{profileData.address}</td>
//                             </tr>
//                             <tr>
//                                 <td>상세주소</td>
//                                 <td>{profileData.detailedaddress}</td>
//                             </tr>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
// export default ProfileForm;