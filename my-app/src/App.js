import './App.css';
import {Routes, Route, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react'
import Header from './Component/Header'
import Main from './Pages/Main';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Modify from "./Pages/Modify";
import RegisterPersonal from "./Pages/RegisterPersonal";
import RegisterGroup from "./Pages/RegisterGroup";
import RegisterCorporate from "./Pages/RegisterCorporate";
import FindInformation from './Pages/FindInformation';
import CarbonFootprint from './Pages/CarbonFootprint';
import Community from './Pages/Community';
import CommunityEdit from './Pages/CommunityEdit';
import CommunityWrite from './Pages/CommunityWrite';
import CommunityRead from './Pages/CommunityRead';
//-----뉴스
import News from "./Pages/News";
//-----뉴스
import Campaign from './Pages/Campaign';
import CampaignWrite from './Pages/CampaignWrite';
import CampaignRead from './Pages/CampaignRead';
import Shop from './Pages/Shop';
import ShopDetail from './Pages/ShopDetail';
import ShopBasket from './Pages/ShopBasket';
import MyPage from './Pages/MyPage';



// 수정 사항 적용 확인용


function App() {
  const navigate = useNavigate();

  // 로그인 상태에 따라 화면에 표시되는 버튼을 달리하는 '조건부렌더링' 구현
  const [loggedIn, setLoggedIn] = useState(false);
  const [userid, setUserid] = useState('');
  const [username, setUsername] = useState('');


  // 페이지가 로드될 때 로그인 상태를 확인하고 상태를 업데이트
  useEffect(() => {
    const storedLoggedIn = sessionStorage.getItem("loggedIn");
    if (storedLoggedIn) {
      setLoggedIn(true);
    }
  }, [setLoggedIn]);

  useEffect(() => {
    // 세션 스토리지에서 userid 가져오기
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        setUserid(userData.userid);
        setUsername(userData.username);
    }
}, []);

    // 로그아웃 시 세션 스토리지에서 로그인 상태 제거
    const handleLogout = () => {
      sessionStorage.removeItem("usertype"); 
      sessionStorage.removeItem("userData"); 
      sessionStorage.removeItem("loggedIn");
      setLoggedIn(false);
      navigate("/"); 
    };









































  return (
    <div className="App">
      <Header
        leftChild={<button onClick={() => navigate("/")}>빵끗😊</button>}
        menu={
          <div className="HeaderMenu">
            <button>탄소중립이란? </button>
            {/* <button onClick={() => navigate("/CarbonFootprint")}>
              탄소발자국{" "}
            </button> */}
            <button onClick={() => navigate("/news")}>
              환경이슈{" "}
            </button>
            {/* <button onClick={() => navigate("/Shop")}>빵끗샵 </button> */}
            <button onClick={() => navigate("/Community")}>커뮤니티 </button>
            {/* <button onClick={() => navigate("/Campaign")}>캠페인 </button> */}
          </div>
        }
        rightChild={
          loggedIn ? (
            <div>
              <button onClick={() => navigate("/MyPage")}>마이페이지</button>
              <button onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <div>
              <button onClick={() => navigate("/Login")}>로그인</button>
              <button onClick={() => navigate("/Register/personal")}>회원가입</button>
            </div>
          )
        }
      />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/Login" element={<Login />}></Route>
        <Route path="/Modify" element={<Modify />}></Route>
        <Route path="/Register" element={<Register />}></Route>
        <Route path="/Register/personal" element={<RegisterPersonal />}></Route>
        <Route
          path="/Register/corporate"
          element={<RegisterCorporate />}
        ></Route>
        <Route path="/Register/group" element={<RegisterGroup />}></Route>
        <Route path="/FindInformation" element={<FindInformation />} />
        <Route path="/CarbonFootprint" element={<CarbonFootprint />} />
        <Route path="/Community" element={<Community loggedIn={loggedIn} />} />
        <Route path='/Community/Edit/:id' element={<CommunityEdit userid={userid}/>} />
        <Route path='/Community/Write' element={<CommunityWrite userid={userid}/>} />
        <Route path='/uploads/' element={<CommunityWrite />} />
        <Route path='/Community/Read/:id' element={<CommunityRead loggedIn={loggedIn} userid={userid}/>} />
        {/* 뉴스 추가 */}
        <Route path="/news" element={<News />} /> 
        <Route path="/Campaign" element={<Campaign />} />
        <Route path="/Campaign/Write" element={<CampaignWrite />} />
        <Route path="/Campaign/Read" element={<CampaignRead />} />
        <Route path="/Shop" element={<Shop />} />
        <Route path="/Shop/Detail" element={<ShopDetail />} />
        <Route path="/Shop/Basket" element={<ShopBasket />} />
        <Route path="/MyPage" element={<MyPage />} />
      </Routes>
    </div>
  );
}

export default App;
