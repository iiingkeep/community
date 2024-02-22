import { useNavigate } from "react-router-dom";
// import ShopBasket from "./ShopBasket";

const ShopDetail = () => {
  const navigate = useNavigate();
  const goBasket = () => {
    navigate('/Shop/Basket')
  }
  const onBasketClick = () => {
    if (window.confirm('상품을 담았습니다. 장바구니로 이동하시겠습니까?')) {
      goBasket();
    }
  }
  return (
    <div className='ShopDetail'>
      <div><img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxZAGU6g8gm72dkMT36gJVbw67-gbvFqt9MdqmV8-MGahVtK52JXhR1UBbojnLqwbDTN4&usqp=CAU'></img></div>
      <div>
        <span>[effo]옥수수칫솔</span>
      </div>
      <div>
        판매가 1000원
      </div>
      <div>
        수량 선택
      </div>
      <div>
        <button>구매하기</button>
        <button onClick={onBasketClick}>장바구니</button>
        <button>찜하기</button>
      </div>
    </div>
  )
}

export default ShopDetail;