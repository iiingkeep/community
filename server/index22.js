const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysqlPromise = require("mysql2/promise");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2'); // 변경됨: mysql2/promise를 사용
const bcrypt = require('bcrypt'); // bcrypt 추가

const app = express();
const PORT = process.env.PORT || 8000;

// server.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  credentials: true,
  origin: "http://localhost:3000",
}));
app.use(express.json());
// app.use(express.json());


// MySQL 연결 설정
const connection = mysql.createConnection({
  // host: "127.0.0.1",
  // user: "root",
  // password: "1234",
  // database: "ezteam2",
  // 외부 데이터 베이스 MySQL
  host: "1.243.246.15",
  user: "root",
  password: "1234",
  database: "ezteam2",
  port: 5005,

  // host: "192.168.45.188",
  // user: "root",
  // password: "1234",
  // database: "ezteam2",
  // port: 5005,
});

// // 프로미스 기반 MySQL 연결 설정
// const PromiseConnection = mysqlPromise.createPool({
//   // host: "127.0.0.1",
//   // user: "root",
//   // password: "1234",
//   // database: "ezteam2",
//   // 외부 데이터 베이스 MySQL
//   host: "1.243.246.15",
//   user: "root",
//   password: "1234",
//   database: "ezteam2",
//   port: 5005,
// });

// // mysql2/promise 모듈을 사용하여 프로미스 기반 연결 풀을 생성합니다.
// const poolPromise = mysqlPromise.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '1320',
//   database: 'community',
//   port: 3306
// });



// CORS 에러 해결을 위한 추가 설정
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
//-----------------------------------------세션-------------------------------------------
const sessionStore = new MySQLStore({
  expiration: 3600000, // 세션의 유효시간 (1시간)
  createDatabaseTable: true, // 세션 테이블을 자동으로 생성
  schema: {
    tableName: 'sessions', // 세션 테이블의 이름
    columnNames: {
      session_id: 'session_id', // 세션 ID를 저장하는 열의 이름
      expires: 'expires', // 세션 만료 시간을 저장하는 열의 이름
      data: 'data', // 세션 데이터를 저장하는 열의 이름
    },
  },
}, connection);

app.use(session({
  secret: 'secretKey', // 랜덤하고 안전한 문자열로 바꾸세요.
  resave: false,
  saveUninitialized: true,
  Store: sessionStore,
  cookie: {
    maxAge: 3600000,
    httpOnly: true,
  },
}));
//-----------------------------------------로그인-----------------------------------------
// app.post("/login", async(req, res) => {
//   const { email, password } = req.body;

//   try {
//     // 이메일로 사용자 검색
//     const [results] = await pool.query('SELECT * FROM login WHERE email = ?', [email]);
//     if (results.length > 0) {
//       // 비밀번호 비교
//       const comparisonResult = await bcrypt.compare(password, results[0].password);
//       if (comparisonResult) {
//         // 로그인 성공
//         res.send({ success: true, message: "로그인 성공", data: results[0] });
//       } else {
//         // 비밀번호 불일치
//         res.send({ success: false, message: "비밀번호가 일치하지 않습니다." });
//       }
//     } else {
//       // 사용자 찾을 수 없음
//       res.send({ success: false, message: "유저 정보가 없습니다." });
//     }
//   } catch (error) {
//     console.error("로그인 중 오류 발생:", error);
//     res.status(500).send({ success: false, message: "서버 에러 발생" });
//   }
// });


app.post("/Login", async (req, res) => {
  const { email, password, usertype } = req.body;//usertype 추가 2/14 김민호

  try {
    // 이메일을 사용하여 데이터베이스에서 사용자를 찾습니다.
    connection.query(
      "SELECT * FROM user WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.error("서버에서 에러 발생:", err);
          res.status(500).send({ success: false, message: "서버 에러 발생" });
        } else {
          if (result.length > 0) {
            const isPasswordMatch = await bcrypt.compare(
              password,
              result[0].password
            );
            if (isPasswordMatch && usertype == result[0].usertype) {
            // 0213 김민호 세션스토리 초기화 확인
            if (!req.session) {
              req.session = {};
            }
            //세션데이터 저장(새로운 데이터 추가시 이부분 수정)
            req.session.usertype = result[0].usertype;//0213 김민호 익스플로우 세션기능 추가
            req.session.userid = result[0].userid;//0213 김민호 익스플로우 세션기능 추가

              res.send({ success: true, message: "로그인 성공", data: result });
            } else {
              res.send({
                success: false,
                message: "정보가 일치하지 않습니다.",
                //가입은 되어 있으나 정보가 맞지 않을 때
              });
            }
          } else {
            res.send({ success: false, message: "유저 정보가 없습니다." });
            //가입된 정보가 없을 시 출력
          }



          
        }
      }
    );
  } catch (error) {
    console.error("비밀번호 비교 중 오류:", error);
    res.status(500).send({ success: false, message: "서버 에러 발생" });
  }
});
//--------------------------------------회원가입-------------------------------------
// app.post("/register", async (req, res) => {
//   const { userName, password, email, address, detailedAddress, phoneNumber, usertype } = req.body;

//   try {
//     // 비밀번호 해싱
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 사용자 번호 생성 (이 부분의 generateUserNumber 함수 구현은 제공되지 않았으므로, 해당 함수가 존재한다고 가정합니다)
//     const userNumber = await generateUserNumber();

//     // 사용자 유형 정의
//     const userTypeNumber = {
//       personal: 1,
//       business: 2,
//       organization: 3,
//     };

//     // 요청된 usertype에 대한 숫자 유형을 찾습니다
//     const userType = userTypeNumber[usertype];

//     // SQL 쿼리 문자열
//     const sql = "INSERT INTO login (userNumber, userName, email, password, address, detailedAddress, phoneNumber, userType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

//     // 데이터베이스 쿼리 실행
//     await pool.query(sql, [userNumber, userName, email, hashedPassword, address, detailedAddress, phoneNumber, userType]);
    
//     console.log("사용자가 성공적으로 등록됨");
//     res.status(200).json({
//       success: true,
//       message: "사용자가 성공적으로 등록됨",
//       userType,
//     });
//   } catch (error) {
//     console.error("회원가입 중 오류:", error);
//     res.status(500).json({
//       success: false,
//       message: "회원가입 중 오류가 발생했습니다.",
//       error: error.message,
//     });
//   }
// });

const usedUserids = new Set(); // 중복 방지를 위한 Set

async function generateUserid(usertype) {
  // 사용자 유형에 기반한 사용자 ID를 생성하는 로직을 추가합니다.
  // 단순성을 위해 사용자 유형에 따라 접두어를 추가하고 6자리의 랜덤 숫자를 붙입니다.
  const prefix = {
    personal: 1,
    business: 2,
    organization: 3,
  }[usertype];
  
  do {
    randomDigits = Math.floor(10000 + Math.random() * 90000);
    userid = `${prefix}${randomDigits}`;
  } while (usedUserids.has(userid)); // 중복된 userid가 있다면 다시 생성

  usedUserids.add(userid); // Set에 추가


  return userid;
}

//-------------------------------이메일 중복 체크 2/14 김민호---------------------------------
app.post("/checkEmailDuplication", (req, res) => {
  const { email } = req.body;

  // 데이터베이스에서 이메일이 이미 존재하는지 확인합니다.
  const sql = "SELECT * FROM user WHERE email = ?";
  connection.query(sql, [email], (err, result) => {
    if (err) {
      console.error("MySQL에서 이메일 중복 확인 중 오류:", err);
      return res.status(500).json({
        success: false,
        message: "이메일 중복 확인 중 오류가 발생했습니다.",
        error: err.message,
      });
    }

    if (result.length > 0) {
      // 이미 등록된 이메일인 경우
      return res.status(200).json({
        success: false,
        message: "이미 등록된 이메일입니다.",
      });
    } else {
      // 중복되지 않은 이메일인 경우
      return res.status(200).json({
        success: true,
        message: "사용 가능한 이메일입니다.",
      });
    }
  });
});
//---------------------------회원가입 기능구현----------------------------------------------
app.post("/Register", async (req, res) => {
  // 클라이언트에서 받은 요청의 body에서 필요한 정보를 추출합니다.
  const { username, password, email, address, detailedaddress, phonenumber, usertype: clientUsertype, businessnumber } = req.body;

  try {
    
    // 비밀번호를 해시화합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    // 회원번호를 생성합니다. (6자리)
    const userid = await generateUserid(clientUsertype);

    // 클라이언트에서 받은 usertype을 서버에서 사용하는 usertype으로 변환합니다.
    const usertypeNumber = {
      personal: 1, // 개인
      business: 2, // 기업
      organization: 3, // 단체
    };

    const serverUsertype = usertypeNumber[clientUsertype];

    // MySQL 쿼리를 작성하여 회원 정보를 데이터베이스에 삽입합니다.
    const sql =
      "INSERT INTO user (userid, username, email, password, address, detailedaddress, phonenumber, usertype, businessnumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(
      sql,
      [userid, username, email, hashedPassword, address, detailedaddress, phonenumber, serverUsertype, businessnumber], 
      (err, result) => {
        if (err) {
          // 쿼리 실행 중 에러가 발생한 경우 에러를 처리합니다.
          console.error("MySQL에 데이터 삽입 중 오류:", err);
          return res.status(500).json({
            success: false,
            message: "회원가입 중 오류가 발생했습니다.",
            error: err.message,
          });
        }
        // 회원가입이 성공한 경우 응답을 클라이언트에게 보냅니다.
        console.log("사용자가 성공적으로 등록됨");
        return res.status(200).json({
          success: true,
          message: "사용자가 성공적으로 등록됨",
          usertype: serverUsertype,
        });
      }
    );
  } catch (error) {
    // 회원가입 중 다른 내부적인 오류가 발생한 경우 에러를 처리합니다.
    console.error("회원가입 중 오류:", error);
    return res.status(500).json({
      success: false,
      message: "내부 서버 오류",
      details: error.message,
    });
  }
});
//-------------------------------------------------카테고리-------------------------------------------------

// // 카테고리별 게시글 목록 출력
// app.get('/Community', async (req, res) => {
//   const { page = 1, categoryId } = req.query;
//   const itemsPerPage = 4;
//   const offset = (page - 1) * itemsPerPage;

//   let query, params;

//   if (categoryId) {
//     query = 'SELECT * FROM Community WHERE categoryId = ? ORDER BY createdAt DESC LIMIT ?, ?';
//     params = [categoryId, offset, itemsPerPage];
//   } else {
//     query = 'SELECT * FROM Community ORDER BY createdAt DESC LIMIT ?, ?';
//     params = [offset, itemsPerPage];
//   }

//   try {
//     const [rows] = await poolPromise.query(query, params);
//     const [countRows] = await poolPromise.query('SELECT COUNT(*) AS total FROM Community' + (categoryId ? ' WHERE categoryId = ?' : ''), categoryId ? [categoryId] : []);
//     const totalItems = countRows[0].total;

//     res.json({ posts: rows, totalItems });
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// 게시글 등록
app.post('/Community/Write', async(req, res) => {
  const { title, content, categoryId } = req.body;

  try {
    const [results] = await poolPromise.query(
      'INSERT INTO Community (title, content, createdAt, categoryId) VALUES (?, ?, NOW(), ?)',
      [title, content, categoryId]
    );
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 특정 카테고리 내의 특정 게시글 조회
app.get('/Community/:categoryId/Read/:id', async (req, res) => {
  const { categoryId, id } = req.params;

  try {
    const [post] = await poolPromise.query(
      'SELECT * FROM Community WHERE id = ? AND categoryId = ?', [id, categoryId]
    );
    if (post.length > 0) {
      res.json(post[0]);
    } else {
      res.status(404).send('Post not found');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 게시글의 좋아요 버튼을 눌렀을 때 데이터 저장 로직.
app.post('/api/likes', async(req, res)=> {
  const { postId, userId } = req.body;
  
  try {
    const createdAt = new Date();
    await poolPromise.query(
      'INSERT INTO Likes (postId, userId, createdAt) VALUES (?, ?, ?)',
      [postId, userId, createdAt]
    );
    res.status(201).json({ message: 'Like added successfully' });
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

  // 댓글 구현
  app.post('/api/comments', async (req, res) => {
    const { postId, userId, content } = req.body;

    try{
      const createdAt = new Date();
      await poolPromise.query
      (
        'INSERT INTO Comment ( postId, userId, content, createdAt ) VALUES (?, ?, ?, ?)',
        [ postId, userId, content, createdAt ]
      );
      res.status(201).json({ message: 'Comment added successfully' }); // 오타 수정: 'Commen' -> 'Comment'
    } catch (error) {
      console.error('Error', error);
      res.status(500).json({ message: 'Intenal Server Error' });
    }
  });

  const fetchComments = () => {
    axios.get('/api/comments?postId=' + postId)
      .then(response => {
        // 댓글 상태 업데이트
        setComments(response.data);
      })
      .catch(error => console.error('댓글을 불러오는 중 오류 발생:', error));
  };
  
  const handleCommentSubmit = (commentData) => {
    axios.post('/api/comments', commentData)
      .then(response => {
        // 성공적으로 댓글을 추가한 후, 댓글 리스트 다시 불러오기
        fetchComments();
      })
      .catch(error => console.error('댓글 추가 중 오류 발생:', error));
  };
  

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
