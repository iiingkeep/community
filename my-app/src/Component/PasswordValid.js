import React, { useState } from 'react';

const PasswordValid = ({ onPasswordValid }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // 부모 컴포넌트에게 기존 비밀번호 유효성 검사를 요청합니다.
        onPasswordValid(password);
    };

    return (
        <div>
            <h4>본인 확인을 위해 비밀번호를 확인해주세요</h4>
            <form onSubmit={handleSubmit}>
                <label>
                    Password:
                    <br />
                    <input
                        type="password"
                        value={password}
                        placeholder='비밀번호를 입력해주세요.'
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                </label>
                <br />
                <button type="submit">확인</button>
            </form>
        </div>
    );
};

export default PasswordValid;
