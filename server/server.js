const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');
const { Console } = require('console');

const app = express();
app.use(cors());

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로

const config = {
  user: 'SYSTEM',
  password: 'test1234',
  connectString: 'localhost:1521/xe'
};

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

// 데이터베이스 연결 설정
async function initializeDatabase() {
  try {
    connection = await oracledb.getConnection(config);
    console.log('Successfully connected to Oracle database');
  } catch (err) {
    console.error('Error connecting to Oracle database', err);
  }
}

initializeDatabase();

// 엔드포인트
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/user/searchId', async (req, res) => {
  const { userId } = req.query;
  console.log(userId);
  try {
    const result = await connection.execute(`SELECT * FROM GUARDIAN_LIST WHERE USERID = '${userId}'`);
    const columnNames = result.metaData.map(column => column.name);

    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/user/searchPhone', async (req, res) => {
  const { phone } = req.query;
  console.log(phone);
  try {
    const result = await connection.execute(`SELECT * FROM GUARDIAN_LIST WHERE PHONE = '${phone}'`);
    const columnNames = result.metaData.map(column => column.name);

    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/user/searchEmail', async (req, res) => {
  const { email } = req.query;
  console.log(email);
  try {
    const result = await connection.execute(`SELECT * FROM GUARDIAN_LIST WHERE EMAIL = '${email}'`);
    const columnNames = result.metaData.map(column => column.name);

    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/user/insert', async (req, res) => {
  const { userId, pwd1, ward, name, birth, addr, phone, email, gender, wardNo } = req.query;

  try {
    await connection.execute(
      `INSERT INTO GUARDIAN_LIST (USERID, PASSWORD, WARD_NUMBER, NAME, BIRTH, ADDRESS, PHONE, EMAIL, GENDER, WARDNO) VALUES (:userId, :pwd1, :ward, :name, :birth, :addr, :phone, :email, :gender, :wardNo)`,
      [userId, pwd1, ward, name, birth, addr, phone, email, gender, wardNo ],
      { autoCommit: true }
    );
    res.json({
        result : "success"
    });
  } catch (error) {
    console.error('Error executing insert', error);
    res.status(500).send('Error executing insert');
  }
});

app.get('/user/Login', async (req, res) => {
  const { userId, pwd, name } = req.query;
  query = `SELECT * FROM GUARDIAN_LIST WHERE USERID = '${userId}' AND PASSWORD = '${pwd}'`;
  console.log(query);

  try {
    const result = await connection.execute(query);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    // 리턴
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/user/list', async (req, res) => {
  const { option, keyword } = req.query;
  let subQuery = "";
  if(option == "all"){
    subQuery = `WHERE TITLE LIKE '%${keyword}%' OR NAME LIKE'%${keyword}%'`;
  } else if(option == "title"){
    subQuery = `WHERE TITLE LIKE '%${keyword}%'`;
  } else if(option == "id"){
    subQuery = `WHERE NAME LIKE '%${keyword}%'`;
  }
  let query = `SELECT * FROM (`
            + `SELECT S.BOARDNO, S.TITLE, G.NAME, TO_CHAR(S.CDATETIME,'YYYY-MM-DD') CTIME, S.CNT, G.USERID AS USERID `
            + `FROM SANATORIUM_BOARD S `
            + `JOIN GUARDIAN_LIST G ON S.USERID = G.USERID `
            + `UNION ALL `
            + `SELECT S.BOARDNO, S.TITLE, C.NAME, TO_CHAR(S.CDATETIME,'YYYY-MM-DD') CTIME, S.CNT, C.CAREGIVER_ID AS USERID `
            + `FROM SANATORIUM_BOARD S `
            + `JOIN CAREGIVER_LIST C ON S.CAREGIVER_ID = C.CAREGIVER_ID) `
            + subQuery + ` ORDER BY BOARDNO`;
  try {
    const result = await connection.execute(query);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json({
        result : "success",
        list : rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/user/info1', async (req, res) => {
  const { boardNo } = req.query;
 query = `SELECT S.BOARDNO "boardNo", S.TITLE "title", `
          + `(CASE WHEN S.USERID IS NOT NULL THEN G.NAME ELSE C.NAME END) "name", `
          + `TO_CHAR(S.CDATETIME, 'YYYY.MM.DD. HH24:MI') "ctime", S.CNT "cnt", S.CONTENTS "contents", `
          + `S.USERID "GUARDIAN_ID", S.CAREGIVER_ID "CAREGIVER_ID" `
          + `FROM SANATORIUM_BOARD S `
          + `LEFT JOIN GUARDIAN_LIST G ON S.USERID = G.USERID `
          + `LEFT JOIN CAREGIVER_LIST C ON S.CAREGIVER_ID = C.CAREGIVER_ID `
          + `WHERE S.BOARDNO = ${boardNo}`;
  try {
    const result = await connection.execute(query);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    // 리턴
    res.json({
        result : "success",
        info : rows[0]
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/user/info2', async (req, res) => {
  const { boardNo } = req.query;
  query = `SELECT G.NAME, C.COMMENT1, G.USERID, TO_CHAR(C.CDATETIME, 'YYYY.MM.DD. HH24:MI') AS CTIME FROM GUARDIAN_LIST G INNER JOIN SANATORIUM_COMMENT C ON G.USERID = C.USERID WHERE C.BOARDNO = ${boardNo}`;
  try {
    const result = await connection.execute(query);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    // 리턴
    res.json({
        result : "success",
        info : rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/user/info3', async (req, res) => {
  const { userId } = req.query;
  query = `SELECT USERID, NAME, BIRTH, ADDRESS, PHONE, EMAIL, GENDER, 'C' AS STATUS `
        + `FROM GUARDIAN_LIST `
        + `WHERE USERID = '${userId}' `
        + `UNION ALL `
        + `SELECT CAREGIVER_ID AS USERID, NAME, BIRTH, ADDRESS, PHONE, EMAIL, GENDER, 'S' AS STATUS `
        + `FROM CAREGIVER_LIST `
        + `WHERE CAREGIVER_ID = '${userId}'`;
  console.log(query);
  try {
    const result = await connection.execute(query);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    // 리턴
    res.json({
        result : "success",
        info : rows[0]
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/care/insert', async (req, res) => {
  const { careId, pwd1, ward, name, birth, addr, phone, email, gender, wardNo } = req.query;

  try {
    await connection.execute(
      `INSERT INTO CAREGIVER_LIST (CAREGIVER_ID, PASSWORD, WARD_NUMBER, NAME, BIRTH, ADDRESS, PHONE, EMAIL, GENDER, WARDNO) VALUES (:careId, :pwd1, :ward, :name, :birth, :addr, :phone, :email, :gender, :wardNo)`,
      [careId, pwd1, ward, name, birth, addr, phone, email, gender, wardNo ],
      { autoCommit: true }
    );
    res.json({
        result : "success"
    });
  } catch (error) {
    console.error('Error executing insert', error);
    res.status(500).send('Error executing insert');
  }
});

app.get('/care/searchId', async (req, res) => {
  const { careId } = req.query;
  try {
    const result = await connection.execute(`SELECT * FROM CAREGIVER_LIST WHERE CAREGIVER_ID = '${careId}'`);
    const columnNames = result.metaData.map(column => column.name);

    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/care/searchPhone', async (req, res) => {
  const { phone } = req.query;
  try {
    const result = await connection.execute(`SELECT * FROM CAREGIVER_LIST WHERE PHONE = '${phone}'`);
    const columnNames = result.metaData.map(column => column.name);

    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/care/searchEmail', async (req, res) => {
  const { email } = req.query;
  try {
    const result = await connection.execute(`SELECT * FROM CAREGIVER_LIST WHERE EMAIL = '${email}'`);
    const columnNames = result.metaData.map(column => column.name);

    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/care/Login', async (req, res) => {
  const { userId, pwd, name } = req.query;
  query = `SELECT * FROM CAREGIVER_LIST WHERE CAREGIVER_ID = '${userId}' AND PASSWORD = '${pwd}'`;

  try {
    const result = await connection.execute(query);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    // 리턴
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/pro/add', async (req, res) => {
  const { title, contents, userId, caregiverId, kind, status } = req.query;
query = `INSERT INTO SANATORIUM_BOARD (BOARDNO, TITLE, CONTENTS, CAREGIVER_ID, USERID, CNT, FAVORITE, KIND, CDATETIME, UDATETIME, STATUS) ` 
      + `VALUES (B_SEQ.NEXTVAL, :title, :contents, :caregiverId, :userId, 0, 0, :kind, SYSDATE, SYSDATE, :status)`;
  try {
    await connection.execute(query,{title, contents, caregiverId: caregiverId || null, userId: userId || null, kind, status},
      { autoCommit: true }
    );
    res.json({
        result : "success"
    });
  } catch (error) {
    console.error('Error executing insert', error);
    res.status(500).send('Error executing insert');
  }
});

app.get('/pro/delete', async (req, res) => {
  const { boardNo } = req.query;

  try {
    await connection.execute(
      `DELETE  FROM SANATORIUM_BOARD B WHERE BOARDNO = :boardNo`,
      [boardNo],
      { autoCommit: true }
    );
    res.json({
        result : "success"
    });
  } catch (error) {
    console.error('Error executing delete', error);
    res.status(500).send('Error executing delete');
  }
});

// 서버 시작
app.listen(3009, () => {
  console.log('Server is running on port 3009');
});
