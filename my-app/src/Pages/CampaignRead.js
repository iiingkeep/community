const CampaignRead = () => {
  return (
    <div className='CampaignRead'>
      첫 번째 글입니다
      <div>
        모여서 환경보호해요!
      </div>
      <span>좋아요</span>
      <div>
        <textarea placeholder='댓글을 남겨보세요'>
        </textarea>
          <button>댓글등록</button>
      </div>
      <div>
        <button>이전글</button>
        <button>다음글</button>
        <button>목록</button>
      </div>
    </div>
  )
}

export default CampaignRead;