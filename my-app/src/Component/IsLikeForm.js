// IsLikeForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const IsLikeForm = ({ userId }) => {
  const [isLike, setIsLike] = useState([]); // 게시물 목록 상태

  useEffect(() => {
    const fetchLike = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/my/islike/${userId}`);
        const userData = response.data;
        setIsLike(userData);
        console.log(userData)
      } catch (error) {
        // console.log('Error 좋아요 date:', error);
      }
    };
    fetchLike();
  }, [userId])

  return (
    <div>
      <h3>좋아요 한 목록</h3>
      <ul>
        {isLike.map(like => (
          <li key={like.postid}>{like.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default IsLikeForm;