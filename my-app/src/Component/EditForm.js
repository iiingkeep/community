// EditForm.js
import axios from "axios";
import { useState, useEffect } from "react";
// import handlePostcode from "./Postcodehandle";
// import DaumPostcod from "react-daum-postcode";
import PasswordValid from "./PasswordValid";

const EditForm = ({ userId }) => {
    const [profileData, setProfileData] = useState({});
    const [showEditForm, setShowEditForm] = useState(false);


    // 컴포넌트가 마운트될 때와 userId가 변경될 때마다 실행
    // axios를 사용하여 서버에서 해당 userId에 해당하는 사용자 프로필 데이터를 가져옵니다.
    // 가져온 데이터를 profileData 상태에 설정
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/my/edit/${userId}`);
                const userData = response.data[0];
                setProfileData(userData);
                // console.log(userData)
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };
        fetchProfile();
    }, [userId]);
    

    // 비밀번호 유효성 검사
    const handlePasswordValid = async (password) => {
        try {
            // 비밀번호 검사 요청을 서버에 보냅니다.
            const response = await axios.post(`http://localhost:8000/pw-valid/${userId}`, {
                userId: userId,
                password: password
            });
            // 검증이 성공하면 수정 양식을 표시합니다.
            setShowEditForm(response.data.isValid);
            const res = response.data.isValid
            console.log(res)
        } catch (error) {
            console.error('Error validating password:', error);
        }
    };
    
    
    // input 필드의 값을 상태에 반영
    // input 요소의 변경 이벤트를 처리
    // name과 value를 추출하여 profileData 상태를 업데이트
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };
    
    // 수정된 정보를 서버에 전송
    const handleEditSubmit = async () => {
        try {
            await axios.put(`http://localhost:8000/my/edit/update/${userId}`, profileData);
            alert('성공적으로 수정되었습니다.');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div>
            {!showEditForm ? (
                <PasswordValid onPasswordValid={handlePasswordValid} />
            ) : (
        <div>
            <h2>Edit Profile</h2>
            <form onSubmit={handleEditSubmit}>
                <label>
                    회원이름:
                    <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        placeholder={profileData.username}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    핸드폰번호:
                    <input
                        type="text"
                        name="phonenumber"
                        value={profileData.phonenumber}
                        placeholder={profileData.phonenumber}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    주소:
                    <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        placeholder={profileData.address}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    상세주소:
                    <input
                        type="text"
                        name="detailedaddress"
                        value={profileData.detailedaddress}
                        placeholder={profileData.detailedaddress}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    이메일:
                    <input
                        type="text"
                        name="email"
                        value={profileData.email}
                        placeholder={profileData.email}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <button type="submit">수정완료</button>
            </form>
        </div>
        )}
        </div>
    );
};

export default EditForm;
