import { useNavigate } from "react-router-dom";

const Shop = () => {
  const navigate = useNavigate();
  const goShopDetail = () => {
    navigate('/Shop/Detail')
  }
  return (
    <div className='Shop'>
      빵끗😊샵
      <div className='GoodsList'>
        <div><img onClick={goShopDetail} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxZAGU6g8gm72dkMT36gJVbw67-gbvFqt9MdqmV8-MGahVtK52JXhR1UBbojnLqwbDTN4&usqp=CAU'></img></div>
        <div><img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFzDQhPN-kzxjxRikkjJnXyZyNTT5m8mfHLRdfaHON17jCNR22_2ysUSRPRtJCHExr0I0&usqp=CAU'></img></div>
        <div><img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ88PyoQE1ud1NXAMY7xZVkkixctxmtoTB-cw&usqp=CAU'></img></div>
      </div>
    </div>
  )
}

export default Shop;