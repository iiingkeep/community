import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from "bcrypt";
import session from "express-session";
// const MySQLStore= require('express-mysql-session')(session);
import MySQLStore from 'express-mysql-session';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url'
// 현재 모듈의 디렉토리 경로를 가져옵니다.
const __dirname = fileURLToPath(new URL(".", import.meta.url));


dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// CORS에러 해결 코드
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
// app.use(cors({ credentials: true, origin: "*" }));

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

// 상호형
app.get("/", (req, res) => res.send(`Hell'o World!`));

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




// //------------------------quill editor 이미지 데이터를 url로 변환---------------------------//

// // multer 설정
// const upload = multer({
//   storage: multer.diskStorage({
//     // 저장할 장소
//     destination(req, file, cb) {
//       cb(null, 'server/public/uploads');
//     },
//     // 저장할 이미지의 파일명
//     filename(req, file, cb) {
//       const ext = path.extname(file.originalname); // 파일의 확장자
//       console.log('file.originalname', file.originalname);
//       // 파일명이 절대 겹치지 않도록 해줘야한다.
//       // 파일이름 + 현재시간밀리초 + 파일확장자명
//       cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
//     },
//   }),
//   // limits: { fileSize: 5 * 1024 * 1024 } // 파일 크기 제한
// });

// // 하나의 이미지 파일만 가져온다.
// app.post('/img', upload.single('img'), (req, res) => {
//   // 해당 라우터가 정상적으로 작동하면 public/uploads에 이미지가 업로드된다.
//   // 업로드된 이미지의 URL 경로를 프론트엔드로 반환한다.
//   console.log('전달받은 파일', req.file);
//   console.log('저장된 파일의 이름', req.file.filename);

//   // 파일이 저장된 경로를 클라이언트에게 반환해준다.
//   const IMG_URL = `http://localhost:8000/public/uploads/${req.file.filename}`;
//   console.log(IMG_URL);
//   res.json({ url: IMG_URL });
// });






// // /Community 엔드포인트에서 게시글 목록을 가져옴
// app.get('/Community', async (req, res) => {
//   try {
//       // 클라이언트로부터 전달된 HTTP 요청의 'page' 쿼리 파라미터 값, 기본값은 1
//       const page = req.query.page || 1;
//       // 페이지당 표시할 게시물 수
//       const itemsPerPage = 4; 
//       // 페이지별 첫번째 게시물의 인덱스
//       const offset = (page - 1) * itemsPerPage;
  
//       const searchQuery = req.query.searchQuery || '';
//       const searchType = req.query.searchType || 'title';

//       // 게시글을 가져오는 기본 쿼리문과 게시글 갯수를 조회하는 기본 쿼리문 설정
//       let query = 'SELECT * FROM community.posts';
//       let countQuery = 'SELECT COUNT(*) AS total FROM community.posts';

//       // 검색어 입력 후 검색버튼을 눌러 게시글을 불러올 경우
//       // 제목 / 본문 / 제목+본문 검색 유형에 맞는 각각의 추가 쿼리문 설정
//       // 제목이나 본문으로 검색 시 필요한 파라미터는 1개, 제목+본문 함께 검색 시 필요한 파라미터는 2개
//     if (searchQuery) {
//       if (searchType === 'title') {
//         query += ' WHERE title LIKE ?';
//         countQuery += ' WHERE title LIKE ?';
//       } else if (searchType === 'content') {
//         query += ' WHERE content LIKE ?';
//         countQuery += ' WHERE content LIKE ?';
//       } else if (searchType === 'titleAndContent') {
//         query += ' WHERE title LIKE ? OR content LIKE ?';
//         countQuery += ' WHERE title LIKE ? OR content LIKE ?';
//       }

//       // 검색어가 일부만 일치해도 게시글이 검색될 수 있도록 하는 변수 설정
//       const searchParam = `%${searchQuery}%`;

//       // 제목 또는 본문으로 검색하는 경우와 제목+본문으로 검색하는 경우 전달해 줘야 하는 파라미터의 갯수가 다르기 때문에 나누어 작성
//       // 제목+본문으로 검색할 시, 전달해 줘야 하는 파라미터는 총 4개
//       if (searchType === 'titleAndContent') {
//         // 페이지 네이션과 최신순 정렬이 되도록 쿼리문 추가 설정
//         query += ' ORDER BY createdat DESC LIMIT ?, ?';
//         countQuery += '';
//       const [rows] = await pool.query(query, [searchParam, searchParam, offset, itemsPerPage]);
//       const [countRows] = await pool.query(countQuery, [searchParam, searchParam]);

//       const totalItems = countRows[0].total;

//       res.json({ posts: rows, totalItems });
//     } else { // 제목 또는 본문으로 검색할 시, 전달해 줘야 하는 파라미터는 총 3개
//       // 페이지 네이션과 최신순 정렬이 되도록 쿼리문 추가 설정
//       query += ' ORDER BY createdat DESC LIMIT ?, ?';
//       countQuery += '';
    
//       const [rows] = await pool.query(query, [searchParam, offset, itemsPerPage]);
//       const [countRows] = await pool.query(countQuery, [searchParam]);
//       const totalItems = countRows[0].total;

//       res.json({ posts: rows, totalItems });
//     }
//     } else {
//       // 검색 기능을 이용하지 않은 모든 게시물 출력
//       query += ' ORDER BY createdat DESC LIMIT ?, ?';
//       const [rows] = await pool.query(query, [offset, itemsPerPage]);

//       const [countRows] = await pool.query(countQuery);
//       const totalItems = countRows[0].total;

//       res.json({ posts: rows, totalItems });
//     }
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
  



//   // /Community/Write 엔드포인트에서  게시글 등록시 DB저장
//   app.post('/Community/Write', async(req, res) => {
//     // 요청 객체에서 title과 content 추출
//     const { title, content } = req.body;

//     try {
//     // 클라이언트에서 받은 title, content데이터와 현재시간 데이터를 posts 테이블에 삽입
//     const [results] = await pool.query(
//       'INSERT INTO posts (title, content, createdat) VALUES (?, ?, NOW())',
//       [title, content],
//     );
//     // 성공 시 HTTP상태 코드 201 반환, 클라이언트에 JSON형식의 성공메세지 전달
//     res.status(201).json({ message: 'Post created successfully' });
//     } catch (error) {
//     // 에러 발생 시 콘솔에 기록, HTTP 상태 코드 500 반환, 클라이언트에 에러 메세지 응답
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//     }
//   });
  



  


//   // /Community/Read/:id 엔드포인트로 상세 게시물의 정보 가져오기
//   app.get('/Community/Read/:id', async (req, res) => {
//     // req.params를 통해 URL에서 추출한 동적 파라미터 :id 값을 가져옴
//     const postId = req.params.id;

//     try {
//       // URL에서 추출한 id값과 같은 id를 가지는 게시물의 데이터를 [rows]에 할당
//       const [rows] = await pool.query('SELECT * FROM community.posts WHERE id = ?', [postId]);
//       // 일치하는 id가 없을 경우 서버 콘솔에 기록, 클라이언트에 404상태 코드와 JSON형식의 메세지 응답
//       if (rows.length === 0) {
//         console.log(`Post with id ${postId} not found`);
//         res.status(404).json({ error: 'Post not found' });
//       } else {
//         // 일치하는 id가 있어 게시글이 조회될 경우, 서버 콘솔에 기록, 클라이언트에 응답 
//         console.log(`Post details sent for post id: ${postId}`);
//         res.json(rows[0]);
//       }
//     } catch (error) {
//       // 에러 발생 시 서버 기록, 클라이언트에 500상태코드와 메세지 응답
//       console.error('Error occurred while retrieving the post:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });



//   // /Community/Edit/:id 엔드포인트에서 이전에 작성된 게시글의 정보 가져옴
//   app.get('/Community/Edit/:id', async (req, res) => {
//     const postId = req.params.id;
  
//     try {
//       // URL에서 추출한 id와 같은 id를 가지는 게시글의 데이터를 가져와 [rows]에 할당
//       const [rows] = await pool.query('SELECT * FROM community.posts WHERE id = ?', [postId]);
//       if (rows.length === 0) {
//         console.log(`Unable to find a post with ID ${postId}`);
//         res.status(404).json({ error: 'Post not found' });
//       } else {
//         console.log(`Post details sent for post id: ${postId}`);
//         res.json(rows[0]);
//       }
//     } catch (error) {
//       console.error('Error occurred while retrieving the post:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });



//   // /Community/Edit/:id 엔트포인트에서 수정한 글의 데이터를 db에 업데이트
//   app.put('/Community/Edit/:id', async (req, res) => {
//     const postId = req.params.id;
//     const { title, content } = req.body;
//     const modifiedAt = new Date();
  
//     try {
//       // URL에서 추출한 id와 일치하는 id를 가진 게시글의 title과 content데이터를 클라이언트에서 받은 데이터로 업데이트
//       await pool.query(
//         'UPDATE community.posts SET title = ?, content = ?, modifiedAt = ? WHERE id = ?',
//         [title, content, modifiedAt, postId]
//       );
      
//       res.status(200).json({ message: 'Post updated successfully' });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   });



//   // /Community/Read/:id 엔드포인트로의 HTTP DELETE 요청 처리 라우트 정의
//   // 해당 id의 게시글 삭제
//   app.delete('/Community/Read/:id', async (req, res) => {
//     const postId = req.params.id;
  
//     try {
//       // URL에서 추출한 id와 같은 id를 가지는 게시글 삭제
//       const [result] = await pool.query('DELETE FROM community.posts WHERE id = ?', [postId]);
      
//       // 해당 id의 게시글이 존재하지 않아 삭제된 행이 없을 시 서버에 기록, 클라이언트에 404상태 반환 및 메세지 응답
//       // affectedRows: 영향을 받는 행 수
//       if (result.affectedRows === 0) {
//         console.log(`Unable to find a post with ID ${postId}`);
//         res.status(404).json({ error: 'Post not found' });
//         // 게시글 삭제 성공 시 서버 기록, 클라이언트에 204상태 반환 
//       } else {
//         console.log(`Post with ID ${postId} has been successfully deleted`);
//         res.status(204).send();
//       }
//     } catch (error) {
//       console.error('Error occurred while deleting the post:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

// //-------------------------------------
// //************댓글 로직**************//
// //-------------------------------------

// // /Community/Read/:id 엔드포인트로 상세 게시물의 정보 가져오기
// app.get('/Community/Read/:id/GetComments', async (req, res) => {
//   // req.params를 통해 URL에서 추출한 동적 파라미터 :id 값을 가져옴
//   const postId = req.params.id;

//   try {
//     // URL에서 추출한 id값과 같은 id를 가지는 게시물의 댓글 데이터를 [rows]에 할당
//     const [rows] = await pool.query('SELECT * FROM community.comments WHERE postId = ?', [postId]);
//     // 일치하는 id가 없을 경우 서버 콘솔에 기록, 클라이언트에 404상태 코드와 JSON형식의 메세지 응답
//     if (rows.length === 0) {
//       console.log(`Post with id ${postId} not found`);
//       res.status(404).json({ error: 'Post not found' });
//     } else {
//       // 일치하는 id가 있어 게시글이 조회될 경우, 서버 콘솔에 기록, 클라이언트에 응답 
//       console.log(`Comment details sent for post id: ${postId}`);
//       res.json(rows);
//       console.log(rows)
//     }
//   } catch (error) {
//     // 에러 발생 시 서버 기록, 클라이언트에 500상태코드와 메세지 응답
//     console.error('Error occurred while retrieving the post:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



// app.post('/Community/Read/:id/SaveComment', async(req, res) => {
  
//   try {
//     // 요청 객체에서 content 추출
//     // url에서 postId 추출
//     const { content, responseTo } = req.body;
//     const postId = req.params.id;
//     console.log(responseTo);
//     console.log(content)
//     // 유저정보 입력
//   // 게시물 존재 여부 확인
//   const [rows] = await pool.query(
//     'SELECT * FROM community.posts WHERE id = ?', [postId]);
//     console.log(rows.length);
//   if (rows.length === 0) {
//     return res.status(404).json({ error: 'Could not find the post.' });
//   }
  
//   // 클라이언트에서 받은 content, postId데이터와 현재시간 데이터를 comments 테이블에 삽입

//   const [results] = await pool.query(
//     'INSERT INTO community.comments (content, postId, createdAt, responseTo) VALUES (?,?, NOW(),?)',
//     [content, postId, responseTo],
//   );

//   // 새로운 댓글의 ID를 사용하여 해당 댓글의 모든 정보를 데이터베이스에서 조회
//   const newCommentId = results.insertId;
//   const [newComment] = await pool.query(
//   'SELECT * FROM community.comments WHERE id = ?',
//   [newCommentId]
//   );
//   // 성공 시 HTTP상태 코드 201 반환, 클라이언트에 JSON형식의 성공메세지 전달
//   res.status(201).json({ message: 'Comment created successfully', result:newComment });
//   } catch (error) {
//   // 에러 발생 시 콘솔에 기록, HTTP 상태 코드 500 반환, 클라이언트에 에러 메세지 응답
//   console.error('Error:', error);
//   res.status(500).json({ message: 'Internal Server Error' });
//   }
// });





// Express 애플리케이션을 특정 포트(PORT)에서 실행
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
