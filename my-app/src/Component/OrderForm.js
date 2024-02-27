// OrderForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 날짜와 시간을 다루는 라이브러리
// 날짜를 원하는 형식으로 포맷팅, 날짜 간의 차이를 계산
import moment from 'moment';
import Paging from './Paging';

const OrderForm = ({ userId }) => {
    const [orderData, setOrderData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태를 추가합니다.
    const itemsPerPage = 1; // 한 페이지에 표시되는 데이터 수를 정의합니다.

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/my/order/${userId}`);
                const userData = response.data;
                setOrderData(userData);
                // console.log(userData)
            } catch (error) {
                console.log('Error fetching order data:', error);
            }
        };
        fetchOrder();
    }, [userId]);

    // 현재 페이지에 해당하는 주문 데이터를 가져오는 함수를 정의합니다.
    const getCurrentOrders = () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return orderData.slice(indexOfFirstItem, indexOfLastItem);
    };

    // 페이지 변경 핸들러 함수를 정의합니다.
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

  return (
    <div>
            <h2>Order Form</h2>
            <ul>
            {/* {orderData.map(order => ( */}
            {getCurrentOrders().map(order => (
                <li key={order.orderNumber}>
                    <p>주문번호: {order.orderNumber}</p>
                    <hr />
                    <p>상품명: {order.productName}</p>
                    <hr />
                    <p>주문상태: {order.status}</p>
                    <hr />
                    <p>주문일자: {moment(order.date).format('YYYY-MM-DD')}</p>
                    <hr />
                    <p>주문자: {order.orderName}</p>
                    <hr />
                    <p>연락처: {order.phoneNumber}</p>
                    <hr />
                    <p>배송주소: {order.addr}</p>
                    <hr />
                    <p>배송메시지: {order.reqMessage}</p>
                    <hr />
                    <p>회원번호: {order.count}</p>
                    <hr />
                    <p>주문금액: {order.totalAmount}원</p>
                    <hr />
                    <p>결제수단: {order.payment}</p>
                    <hr />
                </li>
            ))}
            </ul>
            <Paging
            page={currentPage}
            count={orderData.length}
            handleChangePage={handlePageChange}
            />
        </div>
    // <div>
    //   <h2>Activity Form</h2>
    //   <p>주문번호 {orderData.orderNumber}</p>
    //   <hr />
    //   <p>상품명 {orderData.orderNumber}</p>
    //   <hr />
    //   <p>주문상태 {orderData.status}</p>
    //   {/* moment 객체로 만들고, 원하는 형식으로 포맷 */}
    //   <hr />
    //   <p>주문일자 {moment(orderData.date).format('YYYY-MM-DD')}</p>
    //   <hr />
    //   <p>주문자 {orderData.orderName}</p>
    //   <hr />
    //   <p>연락처 {orderData.phoneNumber}</p>
    //   <hr />
    //   <p>배송주소 {orderData.addr}</p>
    //   <hr />
    //   <p>배송메시지 {orderData.reqMessage}</p>
    //   <hr />
    //   <p>회원번호 {orderData.count}</p>
    //   <hr />
    //   <p>주문금액 {orderData.totalAmount}원</p>
    //   <hr />
    //   <p>결제수단 {orderData.payment}</p>
    //   <hr />
    // </div>
  );
};

export default OrderForm;
