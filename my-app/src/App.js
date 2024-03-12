import './App.css';
import {Routes, Route, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import Header from './Component/Header';
import Footer from './Component/Footer';
import Main from './Pages/Main';
import Login from './Pages/Login';
import RegisterPersonal from "./Pages/RegisterPersonal";
import FindInformation from './Pages/FindInformation';
import Community from './Pages/Community';
import CommunityEdit from './Pages/CommunityEdit';
import CommunityWrite from './Pages/CommunityWrite';
import CommunityRead from './Pages/CommunityRead';
//-----뉴스
import News from "./Pages/News";
//-----뉴스
import NetZero from "./Pages/NetZero";
import MyPage from './Pages/MyPage';
//-----프로필이미지 context 추가
import { ImageProvider } from './Component/ImageContext';


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
    // ImageContext 추가
    <ImageProvider>
    <div className="App">
      <Header loggedIn={loggedIn} handleLogout={handleLogout}
        // leftChild={<button onClick={() => navigate("/")}>빵끗😊</button>}
        // menu={
        //   <div className="HeaderMenu">
        //     <button onClick={() => navigate("/NetZero")}>탄소중립이란? </button>
        //     <button onClick={() => navigate("/news")}>환경이슈 </button>
        //     <button onClick={() => navigate("/Community")}>커뮤니티 </button>
        //   </div>
        // }
        // rightChild={
        //   loggedIn ? (
        //     <div>
        //       <button onClick={() => navigate("/MyPage")}>마이페이지</button>
        //       <button onClick={handleLogout}>로그아웃</button>
        //     </div>
        //   ) : (
        //     <div>
        //       <button onClick={() => navigate("/Login")}>로그인</button>
        //       <button onClick={() => navigate("/RegisterPersonal")}>회원가입</button>
        //     </div>
        //   )
        // }
      />

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/Login" element={<Login />}></Route>
        <Route path="/RegisterPersonal" element={<RegisterPersonal />}></Route>
        <Route path="/FindInformation" element={<FindInformation />} />
        <Route path="/NetZero" element={<NetZero />} />
        <Route path="/Community" element={<Community loggedIn={loggedIn} />} />
        <Route
          path="/Community/Edit/:id"
          element={<CommunityEdit userid={userid} />}
        />
        <Route
          path="/Community/Write"
          element={<CommunityWrite userid={userid} />}
        />
        <Route path="/uploads/" element={<CommunityWrite />} />
        <Route
          path="/Community/Read/:id"
          element={<CommunityRead loggedIn={loggedIn} userid={userid} />}
        />
        {/* 뉴스 추가 */}
        <Route path="/News" element={<News />} />
        <Route path="/MyPage" element={<MyPage />} />
      </Routes>
      
      <Footer/>
      </div>
      </ImageProvider>


  );
}

export default App;
