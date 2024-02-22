const dotenv = require('dotenv');
dotenv.config()


module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
  },
  test: {
    // 테스트 환경 설정
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.2',
  },
  production: {
    // 프로덕션 환경 설정
    username: 'root',
    password: null,
    database: 'database_production',
    host: '127.0.0.2',
  }
};