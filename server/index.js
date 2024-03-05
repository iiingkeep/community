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

// 스케줄 함수 정의
async function executePythonScript(scriptName, message) {
  try {
    await execPromise(`python ${scriptName}`);
    console.log(`${message} 실행 완료`);
  } catch (error) {
    console.error(`오류: ${error.message}`);
  }
}
// 지정시간에 파일 실행 (초(0-59), 분(0-59), 시(0-23), 일(1-31), 월(1-12), 요일(0-7))
// * 로 표시한 경우 반복됨(e.g. * 0 6 * * * : 06시 00분 00초, 01초, 02초...59초)
// 06시 크롤링 실행
schedule.scheduleJob("0 0 6 * * *", async () => {
  await executePythonScript("newsAPI.py", "크롤링 파일");
});
// 06시 00분 20초 워드클라우드 실행
schedule.scheduleJob("20 0 6 * * *", async () => {
  await executePythonScript("newsWC.py", "워드클라우드 파일");
});
// 18시 크롤링 실행
schedule.scheduleJob("0 0 18 * * *", async () => {
  await executePythonScript("newsAPI.py", "크롤링 파일");
});
// 18시 00분 20초 워드클라우드 실행
schedule.scheduleJob("20 0 18 * * *", async () => {
  await executePythonScript("newsWC.py", "워드클라우드 파일");
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
  const { email, password } = req.body;

  try {
    // 이메일을 사용하여 데이터베이스에서 사용자를 찾습니다.
    const [rows, fields] = await poolPromise.execute(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      const isPasswordMatch = await bcrypt.compare(password, rows[0].password);
      if (isPasswordMatch && email == rows[0].email) {
        if (!req.session) {
          req.session = {};
        }
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
  }[usertype];

  // 0219 추가_상호형
  let randomDigits;
  let userid;

  do {
    randomDigits = Math.floor(10000 + Math.random() * 90000);
    userid = `${prefix}${randomDigits}`;
  } while (usedUserNumbers.has(userid)); // 중복된 userid가 있다면 다시 생성
  usedUserNumbers.add(userid); // Set에 추가


  return userid;
}
  
  
// }
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
app.post("/regester", async (req, res) => {
  // 클라이언트에서 받은 요청의 body에서 필요한 정보를 추출합니다.
  const { username, password, email, address, detailedaddress, phonenumber, usertype: clientUsertype, businessnumber, uniquenumber } = req.body;

  try {
    
    // 비밀번호를 해시화합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    // 회원번호를 생성합니다. (6자리)
    const userid = await generateUserid(clientUsertype);

    // 클라이언트에서 받은 usertype을 서버에서 사용하는 usertype으로 변환합니다.
    const usertypeNumber = {
      personal: 1, // 개인
      // business: 2, // 기업
      // organization: 3, // 단체
    };

    const serverUsertype = usertypeNumber[clientUsertype];

    // MySQL 쿼리를 작성하여 회원 정보를 데이터베이스에 삽입합니다.
    const sql =
      "INSERT INTO user (userid, username, email, password, address, detailedaddress, phonenumber, usertype ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(
      sql,
      [userid, username, email, hashedPassword, address, detailedaddress, phonenumber, serverUsertype],
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



// 페이지네이션 기능을 이용하여 게시글 목록이 보여질 수 있도록 db에서 정보 조회, 클라이언트에 전달
app.get('/Community', async (req, res) => {
  try {
    // 클라이언트로부터 전달된 HTTP 요청의 'page' 쿼리 파라미터 값, 기본값은 1
    const categoryId = req.query.categoryId || 1;
    const page = req.query.page || 1;
    // 페이지당 표시할 게시물 수
    const itemsPerPage = 4; 
    // 페이지별 첫번째 게시물의 인덱스
    const offset = (page - 1) * itemsPerPage;
  
    const searchQuery = req.query.searchQuery || '';
    const searchType = req.query.searchType || 'title';

    let query = `
    SELECT 
      cp.*,
      u.username,
      (SELECT COUNT(*) FROM ezteam2.community_comments cc WHERE cc.postid = cp.postid) AS commentCount,
      (SELECT COUNT(*) FROM ezteam2.is_like il WHERE il.postid = cp.postid) AS totalLikes
    FROM 
      ezteam2.community_posts cp
    INNER JOIN 
      user u ON cp.userid = u.userid
    WHERE 
      cp.categoryid = ?
    `;
    let countQuery = 'SELECT COUNT(*) AS total FROM ezteam2.community_posts WHERE categoryid = ?';

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
      // 검색어가 일부만 일치해도 게시글이 검색될 수 있도록 하는 변수 설정
      const searchParam = `%${searchQuery}%`;

      // 제목 또는 본문으로 검색하는 경우와 제목+본문으로 검색하는 경우 전달해 줘야 하는 파라미터의 갯수가 다르기 때문에 나누어 작성
      // 제목+본문으로 검색할 시
      if (searchType === 'titleAndContent') {
      query += 'GROUP BY cp.postid ORDER BY cp.createdat DESC LIMIT ?, ?';
      const [rows] = await poolPromise.query(query, [categoryId, searchParam, searchParam, offset, itemsPerPage]);
      const [countRows] = await poolPromise.query(countQuery, [categoryId, searchParam, searchParam]);

      const totalItems = countRows[0].total;

      res.json({ posts: rows, totalItems });
    } else {  // 제목 또는 본문으로 검색할 시,
      query += 'GROUP BY cp.postid ORDER BY cp.createdat DESC LIMIT ?, ?';
      const [rows] = await poolPromise.query(query, [categoryId, searchParam, offset, itemsPerPage]);

      const [countRows] = await poolPromise.query(countQuery, [categoryId, searchParam]);
      const totalItems = countRows[0].total;

      res.json({ posts: rows, totalItems });
    }
    } else {
            // 검색 기능을 이용하지 않은 모든 게시물 출력
            query += ' GROUP BY cp.postid ORDER BY createdat DESC LIMIT ?, ?';
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




// 게시글 등록시 게시글 정보를 DB에 저장
app.post("/Community/Write", async (req, res) => {
  // 요청 객체에서 title과 content 추출
  const { userid, categoryid, title, content, view } = req.body;

  try {
    // 클라이언트에서 받은 title, content데이터와 현재시간 데이터를 posts 테이블에 삽입
    const [results] = await poolPromise.query(
      "INSERT INTO ezteam2.community_posts (userid, categoryid, title, content, createdat, view) VALUES (?, ?, ?, ?, NOW(), ?)",
      [userid, categoryid, title, content, view]
    );
    // 성공 시 HTTP상태 코드 201 반환, 클라이언트에 JSON형식의 성공메세지 전달
    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    // 에러 발생 시 콘솔에 기록, HTTP 상태 코드 500 반환, 클라이언트에 에러 메세지 응답
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



  // 게시글 상세 페이지 접속 시 db에서 해당 게시물과 작성자 조회, 클라이언트에 정보 반환 
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



  // 게시물 상세페이지 접속 시 해당 게시물의 조회수 증가를 db에 업데이트
  app.put('/Community/Read/:id/IncrementViews', async (req, res) => {
    const postId = req.params.id;
    try {
      // 해당 게시글의 조회수 증가
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


  // 게시글에 대한 좋아요 여부를 db에 업데이트
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
        // 테이블에서 기존에 존재하던 유저의 좋아요 데이터를 삭제
        const deleteQuery = `
          DELETE FROM is_like WHERE userid = ? AND postid = ?
        `;
        await poolPromise.query(deleteQuery, [userid, postId]);
      } else {
        // 아직 좋아요를 하지 않은 경우
        // 테이블에 유저의 좋아요 데이터 삽입
        const insertQuery = `
          INSERT INTO is_like (userid, postid, post_isLiked) VALUES (?, ?, 1)
        `;
        await poolPromise.query(insertQuery, [userid, postId]);
      }
      console.log(`Post like toggled for post id: ${postId}`);

      // 업데이트된 좋아요 수를 조회
      const likeCountQuery = `
      SELECT COUNT(*) AS likeCount FROM is_like WHERE postid = ? AND post_isLiked = 1
      `;
      const [likeCountRows] = await poolPromise.query(likeCountQuery, [postId]);
      const likeCount = likeCountRows[0].likeCount;

      res.status(200).json({ likeCount });
    } catch (error) {
      console.error('Error occurred while toggling post like:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  

  // 해당 게시글을 현재 로그인된 사용자가 좋아요 했는지 확인하여 클라이언트에 정보 반환
  app.get('/Community/Read/:id/CheckLiked', async (req, res) => {
    const postId = req.params.id;
    const userid = req.query.userid;
  
    try {
      const query = `
        SELECT COUNT(*) AS count FROM ezteam2.is_like
        WHERE (userid = ? AND postid = ? AND post_isLiked = 1)
      `;
      const [rows] = await poolPromise.query(query, [userid, postId]);
      // 쿼리에 의해 조희되는 데이터가 있다면 이미 좋아요를 누른 것
      const isLiked = rows[0].count > 0;
      res.status(200).json({ isLiked });
    } catch (error) {
      console.error('Error occurred while checking post like:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // db에서 게시글의 좋아요 갯수를 반환
  app.get('/Community/Read/:id/GetLikeCount', async (req, res) => {
    const postId = req.params.id;
    
    try {
      const query = `
        SELECT COUNT(*) AS likeCount FROM is_like WHERE postid = ? AND post_isLiked = 1
      `;
      const [rows] = await poolPromise.query(query, [postId]);
      const likeCount = rows[0].likeCount;
      res.status(200).json({ likeCount });
    } catch (error) {
      console.error('좋아요 수를 가져오는 중 에러 발생:', error);
      res.status(500).json({ error: '내부 서버 오류' });
    }
  });



  // 유저가 이전에 작성한 게시글의 정보 가져옴
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



  // 수정한 글의 데이터를 db에 업데이트
  app.put('/Community/Edit/:id', async (req, res) => {
    const postId = req.params.id;
    const { userid, categoryid, title, content } = req.body;
  
    try {
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



  // 게시글의 정보를 db에서 삭제
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
      console.log(rows);
      res.json(rows);
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
  // 요청 객체에서 content 추출
  // url에서 postId 추출
  const { userid, content, responseTo } = req.body;
  const postId = req.params.id;
  console.log(responseTo);
  console.log(content)
  try {
    // 유저정보 입력
  // 게시물 존재 여부 확인
  const [rows] = await poolPromise.query(
    'SELECT * FROM ezteam2.community_posts WHERE postid = ?', [postId]);
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

// 댓글 수정 엔드포인트
app.put('/Community/Read/:id/UpdateComment', async (req, res) => {
  const { postId } = req.params;
  const { commentid, content } = req.body;

  try {
    // 댓글 업데이트 쿼리 실행
    await poolPromise.query(
      'UPDATE ezteam2.community_comments SET content = ? WHERE commentid = ?',
      [content, commentid]
    );

    // 수정된 댓글 정보를 다시 가져와 클라이언트에 전송
    const [updatedComment] = await poolPromise.query(
      `SELECT 
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
      [commentid]
    );

    res.status(200).json({ message: 'Comment updated successfully', result: updatedComment });
  } catch (error) {
    console.error('Error occurred while updating the comment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 댓글 삭제 엔드포인트
app.delete('/Community/Read/:id/DeleteComment/:commentId', async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    // 댓글 삭제 쿼리 실행
    await poolPromise.query(
      'DELETE FROM ezteam2.community_comments WHERE commentid = ?',
      [commentId]
    );

    res.status(200).json({ message: 'Comment deleted successfully', commentId });
  } catch (error) {
    console.error('Error occurred while deleting the comment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//--------------------------------------------------------------------------//
//---------------------------------곽별이----------------------------//

//  마이페이지 -----------------------------------

// 사용자 ID에 따라 프로필 데이터를 반환하는 엔드포인트
app.get('/my/:formType/:userid', (req, res) => {
  const userId = req.params.userid;
  const formType = req.params.formType;
  console.log("req.params | UserID:", userId, "FormType:", formType);

  // MySQL 쿼리문 작성
  let query = '';
  let table = '';

  // formType에 따라 테이블 설정
  switch (formType) {
    case 'profile':
      table = 'user';
      break;
    case 'edit':
      table = 'user';
      break;
    case 'activity':
      table = 'community_posts';
      break;
    case 'order':
      table = 'orders';
      break;
    case 'islike':
      table = 'is_like';
      break;
    default:
      res.status(400).json({ message: '유효하지않은 form type' });
      return;
  }

  // activity 폼 쿼리문
  if (formType === 'activity') {
    query = `SELECT * FROM community_posts
             LEFT JOIN community_comments ON community_posts.postid = community_comments.postid
             WHERE community_posts.userid = ?`;

  // islike 폼 쿼리문
  } else if (formType === 'islike') {
    if (!userId) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }
    // 수정 필요*
    query = `SELECT title FROM community_posts A
             LEFT JOIN is_like B ON A.postid = B.postid
             WHERE B.post_isLiked = 1`;

  // 나머지 선택된 폼의 쿼리문
  } else {
    query = `SELECT * FROM ${table} WHERE userid = ?`;
  }

  // 데이터베이스 쿼리 실행
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('(Error) data from database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ message: 'Data not found' });
      return;
    }
    const userData = results;
    res.json(userData);
    console.log(results);
  });
});



//  정보수정 -----------------------------------

app.put('/my/edit/update/:userid', (req, res) => {
  const userId = req.params.userid;
  const profileData = req.body;

  // 사용자 정보 업데이트 쿼리
  const updateQuery = `
      UPDATE user SET username = ?, phonenumber = ?, address = ?, detailedaddress = ?, email = ?
      WHERE userid = ? `;

  // 클라이언트에서 전달된 프로필 데이터
  // userId를 values 배열에 추가
  const { username, phonenumber, address, detailedaddress, email } = profileData;
  const values = [username, phonenumber, address, detailedaddress, email, userId]; 

  // 데이터베이스 쿼리 실행
  connection.query(updateQuery, values, (error, results) => {
      if (error) {
          console.error('Error updating user profile:', error);
          res.status(500).json({ error: 'Failed update profile' });
          return;
      }
      // 업데이트된 사용자 정보 반환
      console.log(results)
      res.json(results);
  });
});


//  정보수정 비밀번호 유효성 검사 -----------------------------------

app.post('/pw-valid/:userid', async (req, res) => {
  const { userId, password } = req.body;
  const Id = req.params.userid;

  try {
      const connection = await poolPromise.getConnection(async conn => conn);
      try {
          // 기존 비밀번호를 가져온다
          const [rows] = await connection.query('SELECT password FROM user WHERE userid = ?', [Id]);
          const hashedPasswordFromDB = rows[0].password;

          // 클라이언트에서 제공한 비밀번호를 해싱
          const isPasswordValid = await bcrypt.compare(password, hashedPasswordFromDB);

          // 비밀번호 비교
          if (isPasswordValid) {
              res.json({ isValid: true });
          } else {
              res.json({ isValid: false });
          }
      } catch (error) {
          console.error('Error executing query:', error);
          res.status(500).json({ error: 'Internal server error' });
      } finally {
          connection.release();
      }
  } catch (error) {
      console.error('Error connecting to database:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


//  프로필 이미지 저장 -----------------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => { // 어디
    cb(null, 'server/public/userimg') // 파일저장경로
  },
  filename: (req, file, cb) => { 
    const ext = path.extname(file.originalname);
    // const filename = file.originalname;
    cb(null, `${Date.now()}${ext}`) // 파일명 설정
  },
});

// 파일이 업로드될 때마다 해당 파일을 '~'/ 디렉토리에
// 현재 시간을 기반으로 한 고유한 파일명으로 저장

const imgup = multer({ storage: storage });

app.post('/my/profile/img', imgup.single('img'), (req, res) => {
  console.log(req.file.path)
  console.log(req.file.destination)
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
  // 파일 업로드 경로
  const filePath = req.file.filename;
  // 이미지 URL 생성 (예: /uploads/파일명)
  console.log('파일객체log',req.file)
  const imageUrl = filePath;
  // const imageUrl = `http://localhost:8000/public/userimg/${filePath}`;
  // const imageUrl = `http://localhost:3000/${filePath}`;
  // const imageUrl = "https://image.utoimage.com/preview/cp872722/2022/12/202212008462_500.jpg";

  const sql = 'INSERT INTO imgup (imgurl) VALUES (?)';
  connection.query(sql, [imageUrl], (err, results, fields) => {
    if (err) {
      console.error('Error: img into MySQL:', err);
    }
    console.log('success: img into MySQL');
    res.send(imageUrl);
  });
});


















































//--------------------------------------------------------------------------//















//--------------------------------------------------------------------------//
//---------------------------------김민규----------------------------//


























































































//--------------------------------------------------------------------------//



// Express 애플리케이션을 특정 포트(PORT)에서 실행
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
