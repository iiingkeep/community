// ActivityForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import "../Styles/MyPage.css";

const ActivityForm = ({userId}) => {
    const [actiData, setActiData] = useState([]);
    const [commData, setCommData] = useState([]);

    useEffect(() => {
      const fetchPost = async () => {
        try {
            const posResponse = await axios.get(`http://localhost:8000/acti-post/${userId}`);
            const posData = posResponse.data;
            setActiData(posData);
            const comResponse = await axios.get(`http://localhost:8000/acti-comment/${userId}`);
            const comData = comResponse.data;
            setCommData(comData);
        } catch (error) {
            console.log('Error fetching data:', error);
        }
    };
    fetchPost();
  }, [userId]);


  return (
  <div className='acti-form'>
    <div className='acti-content'>

      <div className="my-form__title">
      <p className="my-form__text">나의 활동</p>
      </div>

      <div className='form-table-wrapper'>
      <div className='my-content__list'>
        <p className="form-table__title">내가 쓴 글</p>
        <table className='forms-table'>
          <thead>
            <tr>
              {/* <th className='forms-table__num'>No.</th> */}
              <th className='forms-table__date'>날짜</th>
              <th className='forms-table__title'>내용</th>
            </tr>
          </thead>
          <tbody>
            {actiData.map(activity => (
              <tr key={activity.postid}>
                {/* <td>{activity.postid}</td> */}
                <td>{moment(activity.createdAt).format('MM월 DD일')}</td>
                <td>
                <div className="my-table__td-box">
                  <Link className='content__link' to={`/Community/Read/${activity.postid}`}>
                  <span>{activity.title.length > 25 ? activity.title.substring(0, 25) + '...' : activity.title}</span>
                  </Link>
                  </div>
                </td>
                {/* <td>
                <div className="my-table__td-box">
                  {moment(activity.createdAt).format('MM월 DD일')}
                  </div>
                  </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className='my-content__list'>
        <p className="form-table__title">내가 남긴 댓글</p>
        <table className='forms-table'>
          <thead>
            <tr>
              {/* <th className='forms-table__num'>No.</th> */}
              <th className='forms-table__title'>날짜</th>
              <th className='forms-table__title'>내용</th>
            </tr>
          </thead>
          <tbody>
            {commData.map(activity => (
              <tr key={activity.postid}>
                {/* <td>{activity.postid}</td> */}
                <td>{moment(activity.createdAt).format('MM월 DD일')}</td>
                <td>
                <div className="my-table__td-box">
                  <Link className='content__link' to={`/Community/Read/${activity.postid}`}>
                    {/* <span>{activity.content}</span> */}
                  <span>{activity.content.length > 25 ? activity.content.substring(0, 25) + '...' : activity.content}</span>
                  </Link>
                  </div>
                </td>
                {/* <td>
                <div className="my-table__td-box">
                  {moment(activity.createdAt).format('MM월 DD일')}
                  </div></td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </div>

    </div>

   
  </div>
);

};

export default ActivityForm;

