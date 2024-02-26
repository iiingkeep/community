import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import session from "express-session";
// import MySQLStore from 'express-mysql-session';
import MySQLSession from "express-mysql-session"; //0213 김민호
const MySQLStore = MySQLSession(session);
import mysql from "mysql2/promise";
import mysql2 from "mysql2";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
//--------------------이주호 추가
import util from "util";
import { exec } from "child_process";
import schedule from "node-schedule";
//--------------------이주호 추가

// 현재 모듈의 디렉토리 경로를 가져옵니다.
const __dirname = fileURLToPath(new URL(".", import.meta.url));


// dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS에러 해결 코드
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

// MySQL 연결 설정
const poolPromise = mysql.createPool({
  host: "1.243.246.15",
  user: "root",
  password: "1234",
  database: "ezteam2",
  port: 5005,
});

// const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.dotenv;
const connection = mysql2.createConnection({
  host: "1.243.246.15",
  user: "root",
  password: "1234",
  database: "ezteam2",
  port: 5005,
});


// MySQL 연결
// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MySQL: " + err.stack);
//     return;
//   }
//   console.log("Connected to MySQL as id " + connection.threadId);
// });
(async () => {
  try {
    const connection = await poolPromise.getConnection(); // getConnection() 메서드로 커넥션을 가져옵니다.
    console.log("Connected to MySQL as id " + connection.threadId);

    // 커넥션을 다 사용한 후에는 반드시 반환해야 합니다.
    connection.release();
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
  }
})();

// 상호형
app.get("/", (req, res) => res.send(`Hell'o World!`));
//------------------------이주호 추가
const execPromise = util.promisify(exec); // exec함수를 Promise(비동기) 방식으로 변환

// 지정시간에 파일 실행 (초(0-59), 분(0-59), 시(0-23), 일(1-31), 월(1-12), 요일(0-7))
// * 로 표시한 경우 반복됨(e.g. * 0 6 * * * : 06시 00분 00초, 01초, 02초...59초)
// 06시 크롤링 실행
schedule.scheduleJob("0 0 6 * * *", async () => {
  try {
    await execPromise("python newsAPI.py");
    console.log("크롤링 파일 실행 완료");
  } catch (error) {
    console.error(`오류: ${error.message}`);
  }
});

// 06시 00분 30초 워드클라우드 실행
schedule.scheduleJob("30 0 6 * * *", async () => {
  try {
    await execPromise("python newsWC.py");
    console.log("워드클라우드 파일 실행 완료");
  } catch (error) {
    console.error(`오류: ${error.message}`);
  }
});

// 18시 크롤링 실행
schedule.scheduleJob("0 0 18 * * *", async () => {
  try {
    await execPromise("python newsAPI.py");
    console.log("크롤링 파일 실행 완료");
  } catch (error) {
    console.error(`오류: ${error.message}`);
  }
});

// 18시 00분 30초 워드클라우드 실행
schedule.scheduleJob("30 0 18 * * *", async () => {
  try {
    await execPromise("python newsWC.py");
    console.log("워드클라우드 파일 실행 완료");
  } catch (error) {
    console.error(`오류: ${error.message}`);
  }
});

// DB에 있는 뉴스 데이터 가져오기
app.get("/news", (req, res) => {
  connection.query(
    "SELECT newsid, image_url, title, url, views, DATE_FORMAT(pubDate, '%Y-%m-%d %H:%i:%s') AS pubDate FROM news",
    (err, results) => {
      if (err) {
        console.error("MySQL에서 뉴스데이터 가져오기 중 오류:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.json(results);
    }
  );
});

// 조회수 데이터
app.post("/news/views", (req, res) => {
  const { newsid, views } = req.body;
  connection.query(
    "UPDATE news SET views = ? WHERE newsid = ?",
    [views, newsid],
    (err, results) => {
      if (err) {
        console.error("조회수 데이터 업데이트 중 오류:", err);
        res.status(500).send("Internal Server Error");
      }
    }
  );
});

// 좋아요 데이터
app.get("/news/likes", (req, res) => {
  connection.query(
    "SELECT userid, newsid, news_isLiked FROM is_like",
    (err, results) => {
      if (err) {
        console.error("MySQL에서 좋아요 데이터 가져오기 중 오류:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.json(results);
    }
  );
});

app.post("/news/likes", (req, res) => {
  const { userid, newsid, news_isLiked } = req.body;
  // 이미 해당 사용자와 기사에 대한 좋아요 데이터가 있는지 확인
  connection.query(
    "SELECT * FROM is_like WHERE userid = ? AND newsid = ?",
    [userid, newsid],
    (err, results) => {
      if (err) {
        console.error("좋아요 상태 확인 중 오류:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (results.length > 0) {
        // 이미 해당 사용자와 기사에 대한 좋아요 데이터가 있으면 삭제
        connection.query(
          "DELETE FROM is_like WHERE userid = ? AND newsid = ?",
          [userid, newsid],
          (err, updateResults) => {
            if (err) {
              console.error("좋아요 상태 삭제 중 오류:", err);
              res.status(500).send("Internal Server Error");
            } else {
              res.json({ success: true });
            }
          }
        );
      } else {
        // 해당 사용자와 기사에 대한 좋아요 데이터가 없으면 새로 추가
        connection.query(
          "INSERT INTO is_like (userid, newsid, news_isLiked) VALUES (?, ?, ?)",
          [userid, newsid, news_isLiked],
          (err, insertResults) => {
            if (err) {
              console.error("좋아요 상태 추가 중 오류:", err);
              res.status(500).send("Internal Server Error");
            } else {
              res.json({ success: true });
            }
          }
        );
      }
    }
  );
});
//------------------------이주호 추가

//-------------------------------로그인-----------------------------------------------

//-------------------------------익스플로스 세션 0213------------------------------------
const sessionStore = new MySQLStore(
  {
    expiration: 3600000, // 세션의 유효시간 (1시간)
    createDatabaseTable: true, // 세션 테이블을 자동으로 생성
    schema: {
      tableName: "sessions", // 세션 테이블의 이름
      columnNames: {
        session_id: "session_id", // 세션 ID를 저장하는 열의 이름
        expires: "expires", // 세션 만료 시간을 저장하는 열의 이름
        data: "data", // 세션 데이터를 저장하는 열의 이름
      },
    },
  },
  poolPromise
);

app.use(
  session({
    secret: "secretKey", // 랜덤하고 안전한 문자열로 바꾸세요.
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 3600000,
      httpOnly: true,
    },
  })
);
//-------------------------------로그인------------------------------------
app.post("/login", async (req, res) => {
  const { email, password, usertype } = req.body;

  try {
    // 이메일을 사용하여 데이터베이스에서 사용자를 찾습니다.
    const [rows, fields] = await poolPromise.execute(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      const isPasswordMatch = await bcrypt.compare(password, rows[0].password);
      if (isPasswordMatch && usertype == rows[0].usertype) {
        if (!req.session) {
          req.session = {};
        }
        req.session.usertype = rows[0].usertype;
        req.session.userid = rows[0].userid;

        res.send({ success: true, message: "로그인 성공", data: rows });
      } else {
        res.send({
          success: false,
          message: "정보가 일치하지 않습니다.",
        });
      }
    } else {
      res.send({ success: false, message: "유저 정보가 없습니다." });
    }
  } catch (error) {
    console.error("서버에서 에러 발생:", error);
    res.status(500).send({ success: false, message: "서버 에러 발생" });
  }
});
//-------------------------------회원가입----------------------------------------------
//---------------------------------- 회원번호---------------------------------------------
const usedUserNumbers = new Set(); // 중복 방지를 위한 Set

async function generateUserid(usertype) {
  // 사용자 유형에 기반한 사용자 ID를 생성하는 로직을 추가합니다.
  // 단순성을 위해 사용자 유형에 따라 접두어를 추가하고 6자리의 랜덤 숫자를 붙입니다.
  const prefix = {
    personal: 1,
    business: 2,
    organization: 3,
  }[usertype];

  // // 0219 추가_상호형
  // let randomDigits;
  // let userid;

  // do {
  //   randomDigits = Math.floor(10000 + Math.random() * 90000);
  //   userid = `${prefix}${randomDigits}`;
  // } while (usedUserNumbers.has(userid)); // 중복된 userid가 있다면 다시 생성
  
  //---------------------이주호 수정
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  do {
    randomDigits = getRandomNumber(1, 99999);
    STRrandomDigits = randomDigits.toString();

    if (STRrandomDigits.length == 1) {
      userid = `${prefix}0000${randomDigits}`;
    } else if (STRrandomDigits.length == 2) {
      userid = `${prefix}000${randomDigits}`;
    } else if (STRrandomDigits.length == 3) {
      userid = `${prefix}00${randomDigits}`;
    } else if (STRrandomDigits.length == 4) {
      userid = `${prefix}0${randomDigits}`;
    } else {
      userid = `${prefix}${randomDigits}`;
    }
  } while (usedUserNumbers.has(userid)); // 중복된 userid가 있다면 다시 생성
  //---------------------이주호 수정

  usedUserNumbers.add(userid); // Set에 추가

  return userid;
}
//-------------------------------사업자 중복 체크 2/14 김민호---------------------------------
// app.post("/checkbusinessnumber", (req, res) => {
//   const { businessnumber} = req.body;

//   // 데이터베이스에서 이메일이 이미 존재하는지 확인합니다.
//   const sql = "SELECT * FROM user WHERE email = ?";
//   connection.query(sql, [businessnumber], (err, result) => {
//     if (err) {
//       console.error("MySQL에서 사업자번호 중복 확인 중 오류:", err);
//       return res.status(500).json({
//         success: false,
//         message: "사업자 중복 확인 중 오류가 발생했습니다.",
//         error: err.message,
//       });
//     }

//     if (result.length > 0) {
//       // 이미 등록된 사업자인 경우
//       return res.status(200).json({
//         success: false,
//         message: "이미 등록된 사업자입니다.",
//       });
//     } else {
//       // 중복되지 않은 사업자인 경우
//       return res.status(200).json({
//         success: true,
//         message: "사용 가능한 사업자 입니다.",
//       });
//     }
//   });
// });

//-------------------------------이메일 중복 체크 2/14 김민호---------------------------------
app.post("/checkEmailDuplication", async (req, res) => {
  const { email } = req.body;

  try {
    // 데이터베이스에서 이메일이 이미 존재하는지 확인합니다.
    const [rows, fields] = await poolPromise.execute(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
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
  } catch (err) {
    console.error("MySQL에서 이메일 중복 확인 중 오류:", err);
    return res.status(500).json({
      success: false,
      message: "이메일 중복 확인 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});
//---------------------------회원가입 기능구현----------------------------------------------
app.post("/register", async (req, res) => {
  const {
    username,
    password,
    email,
    address,
    detailedaddress,
    phonenumber,
    usertype: clientUsertype,
    businessnumber,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userid = await generateUserid(clientUsertype);
    const usertypeNumber = {
      personal: 1,
      business: 2,
      organization: 3,
    };
    const serverUsertype = usertypeNumber[clientUsertype];

    const sql =
      "INSERT INTO user (userid, username, email, password, address, detailedaddress, phonenumber, usertype, businessnumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const [result, fields] = await poolPromise.execute(sql, [
      userid,
      username,
      email,
      hashedPassword,
      address,
      detailedaddress,
      phonenumber,
      serverUsertype,
      businessnumber,
    ]);

    console.log("사용자가 성공적으로 등록됨");
    return res.status(200).json({
      success: true,
      message: "사용자가 성공적으로 등록됨",
      usertype: serverUsertype,
    });
  } catch (error) {
    console.error("회원가입 중 오류:", error);
    return res.status(500).json({
      success: false,
      message: "내부 서버 오류",
      details: error.message,
    });
  }
});
//---------------------------회원가입 수정구현----------------------------------------------
// app.get("/user", (req, res) => {
//   const { usertype, userid } = req.session;

//   if (!usertype || !userid) {
//     return res.status(401).json({ success: false, message: "로그인되어 있지 않습니다." });
//   }

//   // 여기에서 데이터베이스에서 사용자 정보를 가져오는 로직을 구현합니다.
//   const sql = "SELECT * FROM user WHERE userid = ?";
//   connection.query(sql, [userid], (err, result) => {
//     if (err) {
//       console.error("사용자 정보 조회 중 오류:", err);
//       return res.status(500).json({ success: false, message: "사용자 정보 조회 중 오류가 발생했습니다." });
//     }

//     const userData = result[0]; // 첫 번째 사용자 정보를 가져옴

//     if (!userData) {
//       return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
//     }

//     res.status(200).json(userData);
//   });
// });

// //------------------------quill editor 이미지 데이터를 url로 변환---------------------------//

// multer 설정
const upload = multer({
  storage: multer.diskStorage({
    // 저장할 장소
    destination(req, file, cb) {
      cb(null, "server/public/uploads");
    },
    // 저장할 이미지의 파일명
    filename(req, file, cb) {
      const ext = path.extname(file.originalname); // 파일의 확장자
      console.log("file.originalname", file.originalname);
      // 파일명이 절대 겹치지 않도록 해줘야한다.
      // 파일이름 + 현재시간밀리초 + 파일확장자명
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  // limits: { fileSize: 5 * 1024 * 1024 } // 파일 크기 제한
});

// 하나의 이미지 파일만 가져온다.
app.post("/img", upload.single("img"), (req, res) => {
  // 해당 라우터가 정상적으로 작동하면 public/uploads에 이미지가 업로드된다.
  // 업로드된 이미지의 URL 경로를 프론트엔드로 반환한다.
  console.log("전달받은 파일", req.file);
  console.log("저장된 파일의 이름", req.file.filename);

  // 파일이 저장된 경로를 클라이언트에게 반환해준다.
  const IMG_URL = `http://localhost:8000/public/uploads/${req.file.filename}`;
  console.log(IMG_URL);
  res.json({ url: IMG_URL });
});

// /Community 엔드포인트에서 게시글 목록을 가져옴
// app.get('/Community', async (req, res) => {
//   try {
//       // 클라이언트로부터 전달된 HTTP 요청의 'page' 쿼리 파라미터 값, 기본값은 1
//       const categoryId = req.query.categoryId || 1;
//       const page = req.query.page || 1;
//       // 페이지당 표시할 게시물 수
//       const itemsPerPage = 4; 
//       // 페이지별 첫번째 게시물의 인덱스
//       const offset = (page - 1) * itemsPerPage;
  
//       const searchQuery = req.query.searchQuery || '';
//       const searchType = req.query.searchType || 'title';

//       // 게시글을 가져오는 기본 쿼리문과 게시글 갯수를 조회하는 기본 쿼리문 설정
//       let query = 'SELECT * FROM ezteam2.community_posts WHERE categoryid = ?';
//       let countQuery = 'SELECT COUNT(*) AS total FROM ezteam2.community_posts WHERE categoryid = ?';

//       // 검색어 입력 후 검색버튼을 눌러 게시글을 불러올 경우
//       // 제목 / 본문 / 제목+본문 검색 유형에 맞는 각각의 추가 쿼리문 설정
//       // 제목이나 본문으로 검색 시 필요한 파라미터는 1개, 제목+본문 함께 검색 시 필요한 파라미터는 2개
//     if (searchQuery) {
//       if (searchType === 'title') {
//         query += ' AND title LIKE ?';
//         countQuery += ' AND title LIKE ?';
//       } else if (searchType === 'content') {
//         query += ' AND content LIKE ?';
//         countQuery += ' AND content LIKE ?';
//       } else if (searchType === 'titleAndContent') {
//         query += ' AND (title LIKE ? OR content LIKE) ?';
//         countQuery += ' AND (title LIKE ? OR content LIKE) ?';
//       }

//       // 검색어가 일부만 일치해도 게시글이 검색될 수 있도록 하는 변수 설정
//       const searchParam = `%${searchQuery}%`;

//       // 제목 또는 본문으로 검색하는 경우와 제목+본문으로 검색하는 경우 전달해 줘야 하는 파라미터의 갯수가 다르기 때문에 나누어 작성
//       // 제목+본문으로 검색할 시, 전달해 줘야 하는 파라미터는 총 4개
//       if (searchType === 'titleAndContent') {
//         // 페이지 네이션과 최신순 정렬이 되도록 쿼리문 추가 설정
//         query += ' ORDER BY createdat DESC LIMIT ?, ?';
//         countQuery += '';
//       const [rows] = await poolPromise.query(query, [categoryId, searchParam, searchParam, offset, itemsPerPage]);
//       const [countRows] = await poolPromise.query(countQuery, [categoryId, searchParam, searchParam]);

//       const totalItems = countRows[0].total;

//       res.json({ posts: rows, totalItems });
//     } else { // 제목 또는 본문으로 검색할 시, 전달해 줘야 하는 파라미터는 총 3개
//       // 페이지 네이션과 최신순 정렬이 되도록 쿼리문 추가 설정
//       query += ' ORDER BY createdat DESC LIMIT ?, ?';
//       countQuery += '';
    
//       const [rows] = await poolPromise.query(query, [categoryId, searchParam, offset, itemsPerPage]);
//       const [countRows] = await poolPromise.query(countQuery, [categoryId, searchParam]);
//       const totalItems = countRows[0].total;

//       res.json({ posts: rows, totalItems });
//     }
//     } else {
//       // 검색 기능을 이용하지 않은 모든 게시물 출력
//       query += ' ORDER BY createdat DESC LIMIT ?, ?';
//       const [rows] = await poolPromise.query(query, [categoryId, offset, itemsPerPage]);

//       const [countRows] = await poolPromise.query(countQuery, [categoryId]);
//       const totalItems = countRows[0].total;

//       res.json({ posts: rows, totalItems });
//     }
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
app.get('/Community', async (req, res) => {
  try {
    const categoryId = req.query.categoryId || 1;
    const page = req.query.page || 1;
    const itemsPerPage = 4; 
    const offset = (page - 1) * itemsPerPage;
  
    const searchQuery = req.query.searchQuery || '';
    const searchType = req.query.searchType || 'title';

    let query = `
      SELECT 
        cp.*,
        u.username
      FROM 
        ezteam2.community_posts cp
      INNER JOIN 
        user u ON cp.userid = u.userid
      WHERE 
        cp.categoryid = ?
    `;
    let countQuery = 'SELECT COUNT(*) AS total FROM ezteam2.community_posts WHERE categoryid = ?';

    let likeQuery = `SELECT COUNT(*) AS count FROM is_like WHERE userid = ? AND postid = ?`

    if (searchQuery) {
      if (searchType === 'title') {
        query += ' AND cp.title LIKE ?';
        countQuery += ' AND title LIKE ?';
      } else if (searchType === 'content') {
        query += ' AND cp.content LIKE ?';
        countQuery += ' AND content LIKE ?';
      } else if (searchType === 'titleAndContent') {
        query += ' AND (cp.title LIKE ? OR cp.content LIKE ?)';
        countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      }

      const searchParam = `%${searchQuery}%`;

      query += ' ORDER BY cp.createdat DESC LIMIT ?, ?';
      const [rows] = await poolPromise.query(query, [categoryId, searchParam, searchParam, offset, itemsPerPage]);
      const [countRows] = await poolPromise.query(countQuery, [categoryId, searchParam, searchParam]);

      const totalItems = countRows[0].total;

      res.json({ posts: rows, totalItems });
    } else {
      query += ' ORDER BY cp.createdat DESC LIMIT ?, ?';
      const [rows] = await poolPromise.query(query, [categoryId, offset, itemsPerPage]);

      const [countRows] = await poolPromise.query(countQuery, [categoryId]);
      const totalItems = countRows[0].total;

      res.json({ posts: rows, totalItems });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// /Community/Write 엔드포인트에서  게시글 등록시 DB저장
app.post("/Community/Write", async (req, res) => {
  // 요청 객체에서 title과 content 추출
  const { userid, categoryid, title, content } = req.body;

  try {
    // 클라이언트에서 받은 title, content데이터와 현재시간 데이터를 posts 테이블에 삽입
    const [results] = await poolPromise.query(
      "INSERT INTO ezteam2.community_posts (userid, categoryid, title, content, createdat) VALUES (?, ?, ?, ?, NOW())",
      [userid, categoryid, title, content]
    );
    // 성공 시 HTTP상태 코드 201 반환, 클라이언트에 JSON형식의 성공메세지 전달
    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    // 에러 발생 시 콘솔에 기록, HTTP 상태 코드 500 반환, 클라이언트에 에러 메세지 응답
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// // /Community/Read/:id 엔드포인트로 상세 게시물의 정보 가져오기
// app.get("/Community/Read/:id", async (req, res) => {
//   // req.params를 통해 URL에서 추출한 동적 파라미터 :id 값을 가져옴
//   const postId = req.params.id;

//   try {
//     // URL에서 추출한 id값과 같은 id를 가지는 게시물의 데이터를 [rows]에 할당
//     const [rows] = await poolPromise.query(
//       "SELECT * FROM community.posts WHERE id = ?",
//       [postId]
//     );
//     // 일치하는 id가 없을 경우 서버 콘솔에 기록, 클라이언트에 404상태 코드와 JSON형식의 메세지 응답
//     if (rows.length === 0) {
//       console.log(`Post with id ${postId} not found`);
//       res.status(404).json({ error: "Post not found" });
//     } else {
//       // 일치하는 id가 있어 게시글이 조회될 경우, 서버 콘솔에 기록, 클라이언트에 응답
//       console.log(`Post details sent for post id: ${postId}`);
//       res.json(rows[0]);
//     }
//   } catch (error) {
//     // 에러 발생 시 서버 기록, 클라이언트에 500상태코드와 메세지 응답
//     console.error("Error occurred while retrieving the post:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });




  


  // /Community/Read/:id 엔드포인트로 상세 게시물의 정보 가져오기
  // app.get('/Community/Read/:id', async (req, res) => {
  //   // req.params를 통해 URL에서 추출한 동적 파라미터 :id 값을 가져옴
  //   const postId = req.params.id;
  //   try {
  //     // URL에서 추출한 id값과 같은 id를 가지는 게시물의 데이터를 [rows]에 할당
  //     const [rows] = await poolPromise.query('SELECT * FROM ezteam2.community_posts WHERE postid = ?', [postId]);
  //     // 일치하는 id가 없을 경우 서버 콘솔에 기록, 클라이언트에 404상태 코드와 JSON형식의 메세지 응답
  //     if (rows.length === 0) {
  //       console.log(`Post with id ${postId} not found`);
  //       res.status(404).json({ error: 'Post not found' });
  //     } else {
  //       // 일치하는 id가 있어 게시글이 조회될 경우, 서버 콘솔에 기록, 클라이언트에 응답 
  //       console.log(`Post details sent for post id: ${postId}`);
  //       res.json(rows[0]);
  //     }
  //   } catch (error) {
  //     // 에러 발생 시 서버 기록, 클라이언트에 500상태코드와 메세지 응답
  //     console.error('Error occurred while retrieving the post:', error);
  //     res.status(500).json({ error: 'Internal Server Error' });
  //   }
  // });
  app.get('/Community/Read/:id', async (req, res) => {
    const postId = req.params.id;
    try {
      const query = `
        SELECT 
          cp.*,
          u.username
        FROM 
          ezteam2.community_posts cp
        INNER JOIN 
          user u ON cp.userid = u.userid
        WHERE 
          cp.postid = ?
      `;
      const [rows] = await poolPromise.query(query, [postId]);
  
      if (rows.length === 0) {
        console.log(`Post with id ${postId} not found`);
        res.status(404).json({ error: 'Post not found' });
      } else {
        console.log(`Post details sent for post id: ${postId}`);
        res.json(rows[0]);
      }
    } catch (error) {
      console.error('Error occurred while retrieving the post:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Community/Read/:id/IncrementViews 엔드포인트에 조회수 증가를 db에 업데이트
  app.put('/Community/Read/:id/IncrementViews', async (req, res) => {
    const postId = req.params.id;
    try {
      // 해당 게시글의 조회수를 증가시키는 쿼리 실행
      const query = `
        UPDATE ezteam2.community_posts 
        SET view = view + 1 
        WHERE postid = ?
      `;
      await poolPromise.query(query, [postId]);
      res.sendStatus(200);
    } catch (error) {
      console.error('Error occurred while incrementing views:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // /Community/Read/:id/ToggleLike 
  app.put('/Community/Read/:id/ToggleLike', async (req, res) => {
    const postId = req.params.id;
    const { userid } = req.body;
  
    try {
      // 해당 유저가 해당 게시글을 이미 좋아요 했는지 확인
      const checkQuery = `
        SELECT COUNT(*) AS count FROM is_like WHERE userid = ? AND postid = ?
      `;
      const [checkRows] = await poolPromise.query(checkQuery, [userid, postId]);
      
      // 이미 좋아요를 한 경우
      if (checkRows[0].count > 0) {
        // 좋아요 취소
        const deleteQuery = `
          DELETE FROM is_like WHERE userid = ? AND postid = ?
        `;
        await poolPromise.query(deleteQuery, [userid, postId]);
      } else {
        // 아직 좋아요를 하지 않은 경우
        const insertQuery = `
          INSERT INTO is_like (userid, postid, post_isLiked) VALUES (?, ?, 1)
        `;
        await poolPromise.query(insertQuery, [userid, postId]);
      }
      
      console.log(`Post like toggled for post id: ${postId}`);
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error occurred while toggling post like:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

  
  app.get('/Community/Read/:id/CheckLiked', async (req, res) => {
    const postId = req.params.id;
    const userid = req.query.userid;
  
    try {
      // 해당 게시글을 현재 로그인된 사용자가 좋아요 했는지 확인
      const query = `
        SELECT COUNT(*) AS count FROM ezteam2.is_like
        WHERE (userid = ? AND postid = ? AND post_isLiked = 1)
      `;
      const [rows] = await poolPromise.query(query, [userid, postId]);
      
      console.log(userid);
      console.log(postId);
      console.log(rows);
      const isLiked = rows[0].count > 0;
      res.status(200).json({ isLiked });
    } catch (error) {
      console.error('Error occurred while checking post like:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // /Community/Edit/:id 엔드포인트에서 이전에 작성된 게시글의 정보 가져옴
  app.get('/Community/Edit/:id', async (req, res) => {
    const postId = req.params.id;
  
    try {
      // URL에서 추출한 id와 같은 id를 가지는 게시글의 데이터를 가져와 [rows]에 할당
      const [rows] = await poolPromise.query('SELECT * FROM ezteam2.community_posts WHERE postid = ?', [postId]);
      if (rows.length === 0) {
        console.log(`Unable to find a post with ID ${postId}`);
        res.status(404).json({ error: 'Post not found' });
      } else {
        console.log(`Post details sent for post id: ${postId}`);
        res.json(rows[0]);
      }
    } catch (error) {
      console.error('Error occurred while retrieving the post:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  // /Community/Edit/:id 엔트포인트에서 수정한 글의 데이터를 db에 업데이트
  app.put('/Community/Edit/:id', async (req, res) => {
    const postId = req.params.id;
    const { userid, categoryid, title, content } = req.body;
  
    try {
      // URL에서 추출한 id와 일치하는 id를 가진 게시글의 title과 content데이터를 클라이언트에서 받은 데이터로 업데이트
      await poolPromise.query(
        'UPDATE ezteam2.community_posts SET userid = ?, categoryid = ?, title = ?, content = ? WHERE postid = ?',
        [userid, categoryid, title, content, postId]
      );
      
      res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



  // /Community/Read/:id 엔드포인트로의 HTTP DELETE 요청 처리 라우트 정의
  // 해당 id의 게시글 삭제
  app.delete('/Community/Read/:id', async (req, res) => {
    const postId = req.params.id;
  
    try {
      // URL에서 추출한 id와 같은 id를 가지는 게시글 삭제
      const [result] = await poolPromise.query('DELETE FROM ezteam2.community_posts WHERE postid = ?', [postId]);
      
      // 해당 id의 게시글이 존재하지 않아 삭제된 행이 없을 시 서버에 기록, 클라이언트에 404상태 반환 및 메세지 응답
      // affectedRows: 영향을 받는 행 수
      if (result.affectedRows === 0) {
        console.log(`Unable to find a post with ID ${postId}`);
        res.status(404).json({ error: 'Post not found' });
        // 게시글 삭제 성공 시 서버 기록, 클라이언트에 204상태 반환 
      } else {
        console.log(`Post with ID ${postId} has been successfully deleted`);
        res.status(204).send();
      }
    } catch (error) {
      console.error('Error occurred while deleting the post:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// //-------------------------------------
// //************댓글 로직**************//
// //-------------------------------------

// /Community/Read/:id 엔드포인트로 상세 게시물의 정보 가져오기
app.get('/Community/Read/:id/GetComments', async (req, res) => {
  // req.params를 통해 URL에서 추출한 동적 파라미터 :id 값을 가져옴
  const postId = req.params.id;

  try {
    // URL에서 추출한 id값과 같은 id를 가지는 게시물의 댓글 데이터를 [rows]에 할당
    const [rows] = await poolPromise.query(`
      SELECT 
        community_comments.*, 
        user.username 
      FROM 
        ezteam2.community_comments 
      INNER JOIN 
        ezteam2.user 
      ON 
        community_comments.userid = user.userid
      WHERE 
        community_comments.postid = ?`, [postId]);
    // 일치하는 id가 없을 경우 서버 콘솔에 기록, 클라이언트에 404상태 코드와 JSON형식의 메세지 응답
    if (rows.length === 0) {
      console.log(`Post with id ${postId} not found`);
      res.status(404).json({ error: 'Post not found' });
    } else {
      // 일치하는 id가 있어 게시글이 조회될 경우, 서버 콘솔에 기록, 클라이언트에 응답 
      console.log(`Comment details sent for post id: ${postId}`);
      res.json(rows);
      console.log(rows)
    }
  } catch (error) {
    // 에러 발생 시 서버 기록, 클라이언트에 500상태코드와 메세지 응답
    console.error('Error occurred while retrieving the post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/Community/Read/:id/SaveComment', async(req, res) => {
  
  try {
    // 요청 객체에서 content 추출
    // url에서 postId 추출
    const { userid, content, responseTo } = req.body;
    const postId = req.params.id;
    console.log(responseTo);
    console.log(content)
    // 유저정보 입력
  // 게시물 존재 여부 확인
  const [rows] = await poolPromise.query(
    'SELECT * FROM ezteam2.community_comments WHERE postid = ?', [postId]);
    console.log(rows.length);
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Could not find the post.' });
  }
  
  // 클라이언트에서 받은 content, postId데이터와 현재시간 데이터를 comments 테이블에 삽입

  const [results] = await poolPromise.query(
    'INSERT INTO ezteam2.community_comments (userid, postid, content, createdAt, responseTo) VALUES (?,?,?, NOW(),?)',
    [userid, postId, content, responseTo],
  );

  // 새로운 댓글의 ID를 사용하여 해당 댓글의 모든 정보를 데이터베이스에서 조회
  const newCommentId = results.insertId;
  const [newComment] = await poolPromise.query(`
  SELECT 
    community_comments.*, 
    user.username 
  FROM 
    ezteam2.community_comments 
  INNER JOIN 
    ezteam2.user 
  ON 
    community_comments.userid = user.userid
  WHERE 
    community_comments.commentid = ?`, 
[newCommentId]);
  // 성공 시 HTTP상태 코드 201 반환, 클라이언트에 JSON형식의 성공메세지 전달
  res.status(201).json({ message: 'Comment created successfully', result:newComment });
  } catch (error) {
  // 에러 발생 시 콘솔에 기록, HTTP 상태 코드 500 반환, 클라이언트에 에러 메세지 응답
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Express 애플리케이션을 특정 포트(PORT)에서 실행
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
