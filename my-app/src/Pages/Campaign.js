import { useNavigate } from "react-router-dom";

const Campaign = () => {
  const navigate = useNavigate();

  const goCampaignWrite = () => {
    return (
      navigate('/Campaign/Write')
    )
  }
  const goCampaignRead = () => {
    return (
      navigate('/Campaign/Read')
    )
  }

  return (
    <div className='Campaign'>
      <div>
        지역별 캠페인(지도)
      </div>
      <div className='PostListBox'>
      <div>
        <span>번호</span>
        <span>제목</span>
        <span>작성자</span>
      </div>
      <div>
        <span>1</span>
        <span className='PostName' onClick={goCampaignRead}>첫 번째 글입니다</span>
        <span>연진</span>
      </div>
      </div>
      <div>
        <button onClick={goCampaignWrite}>글쓰기</button>
      </div>
    </div>
  )
}

export default Campaign;