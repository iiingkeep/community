// ActivityForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import "../Styles/MyPage.css";

const ActivityForm = ({userId}) => {
    const [actiData, setActiData] = useState([]);

    useEffect(() => {
      const fetchActi = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/my/activity/${userId}`);
            const userData = response.data;
            setActiData(userData);
        } catch (error) {
            console.log('Error fetching data:', error);
        }
    };
    fetchActi();
  }, [userId]);

  return (
  <div className='acti-form inner'>
    <div className='acti-post'>
      <div className='acti-post__list'>
        <h2>게시물</h2>
        <table className='acti-table'>
          <thead>
            <tr>
              <th>No.</th>
              <th>내용</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            {actiData.map(activity => (
              <tr key={activity.postid}>
                <td>{activity.postid}</td>
                <td>
                  <Link to={`/Community/Read/${activity.postid}`}>
                    <span>{activity.title}</span>
                  </Link>
                </td>
                <td>{moment(activity.createdAt).format('MM월 DD일')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className='acti-comm'>
      <div className='acti-comm__list'>
        <h2>댓글</h2>
        <table className='acti-table'>
          <thead>
            <tr>
              <th>No.</th>
              <th>내용</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            {actiData.map(activity => (
              <tr key={activity.postid}>
                <td>{activity.postid}</td>
                <td>
                  <Link to={`/Community/Read/${activity.postid}`}>
                    <span>{activity.content}</span>
                  </Link>
                </td>
                <td>{moment(activity.createdAt).format('MM월 DD일')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

};

export default ActivityForm;
