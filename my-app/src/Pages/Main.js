import {useNavigate} from 'react-router-dom';
import './Main.css'


const Main = () => {
  const navigate = useNavigate();
  
  

  
  return (
    <div className="Main">
      <div className='LeftSection'>
        <div className='LoginBox'>
          로그인
        </div>
        <div className='CloudBox'>
          워드 클라우드
        </div>
      </div>
      <div className='RightSection'>
        <div className='CommunityBox'>
          커뮤니티
        </div>
        <div className='NewsBox'>
          뉴스
        </div>
      </div>
      
      
    </div>
  )
}

export default Main;