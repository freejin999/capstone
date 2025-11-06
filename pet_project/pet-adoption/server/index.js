/* ====================================================
 * * 1. 기본 설정 및 라이브러리 임포트
 * * ==================================================== */
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // mysql2/promise 사용
const bcrypt = require('bcryptjs'); // 🚨 비밀번호 암호화를 위해 bcryptjs 임포트

const app = express();
const PORT = 3001;


/* ====================================================
 * * 2. MySQL DB 커넥션 풀 생성
 * * ==================================================== */
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'kiwu!@', // 🚨 실제 DB 비밀번호로 변경하세요!
    database: 'pet_project_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


/* ====================================================
 * * 3. 미들웨어 설정
 * * ==================================================== */
app.use(cors());       // CORS 허용
app.use(express.json()); // JSON 요청 본문(body) 파싱


/* ====================================================
 * * 4. 임시 더미 데이터 (DB 미연동 API용)
 * * ==================================================== */
// 입양 공고 더미 데이터 (adoption API용)
const adoptionPets = [
    {"id":1,"name":"복돌이","species":"개","breed":"믹스","age":3,"gender":"남","size":"중형","region":"서울시 강남구","image":"https://placehold.co/400x400/ff7f50/ffffff?text=Bokdol", "description": "사람을 너무 좋아하는 활발한 성격의 강아지입니다."},
    {"id":2,"name":"나비","species":"개","breed":"시츄","age":5,"gender":"여","size":"소형","region":"서울시 송파구","image":"https://placehold.co/400x400/9acd32/ffffff?text=Nabi", "description": "조용하고 온순한 성격입니다."},
    {"id":3,"name":"호랑이","species":"고양이","breed":"코숏","age":2,"gender":"남","size":"중형","region":"경기도 성남시","image":"https://placehold.co/400x400/1e90ff/ffffff?text=Horang", "description": "사람을 잘 따르는 친화력 좋은 고양이입니다."},
    {"id":4,"name":"초코","species":"개","breed":"푸들","age":4,"gender":"여","size":"소형","region":"서울시 마포구","image":"https://placehold.co/400x400/ffa07a/ffffff?text=Choco", "description": "영리하고 사교적인 성격의 푸들입니다."},
    {"id":5,"name":"구름","species":"고양이","breed":"터키시앙고라","age":1,"gender":"여","size":"중형","region":"서울시 강서구","image":"https://placehold.co/400x400/ff4500/ffffff?text=Gureum", "description": "새하얀 털을 가진 아름다운 고양이입니다."},
    {"id":6,"name":"백구","species":"개","breed":"진돗개","age":6,"gender":"남","size":"대형","region":"경기도 고양시","image":"https://placehold.co/400x400/7b68ee/ffffff?text=Baekgu", "description": "충직하고 주인을 잘 따르는 진돗개입니다."},
];
// 리뷰 더미 데이터 (reviews API용)
const reviews = [
    { id: 1, productName: "프리미엄 강아지 사료", category: "사료", rating: 5, author: "행복한댕댕이", date: "2024-01-20", content: "우리 강아지가 정말 잘 먹어요!", image: "https://placehold.co/300x300/FFB6C1/ffffff?text=Premium+Food", likes: 42, comments: 0 },
    { id: 2, productName: "고양이 자동 급식기", category: "급식기", rating: 4, author: "냥집사", date: "2024-01-19", content: "출장이 잦은 저에게 딱이에요.", image: "https://placehold.co/300x300/87CEEB/ffffff?text=Auto+Feeder", likes: 28, comments: 0 },
    { id: 3, productName: "반려견 목욕 샴푸", category: "미용", rating: 5, author: "깨끗이", date: "2024-01-18", content: "향도 좋고 거품도 잘 나요.", image: "https://placehold.co/300x300/98FB98/ffffff?text=Pet+Shampoo", likes: 35, comments: 0 },
];


/* ====================================================
 * * 5. API 라우트 (Routes)
 * * ==================================================== */

// ----------------------------------------------------
// (A) 테스트 및 DB 미연동 API
// ----------------------------------------------------
app.get('/', (req, res) => {
    res.send('Node.js 서버가 MySQL DB와 함께 성공적으로 실행 중입니다! 🎉');
});

app.get('/api/adoption', (req, res) => {
    console.log('GET /api/adoption 요청 수신');
    res.json(adoptionPets);
});

app.get('/api/adoption/:id', (req, res) => {
    const petId = parseInt(req.params.id);
    const pet = adoptionPets.find(p => p.id === petId);
    if (!pet) {
        return res.status(404).json({ message: '해당 동물을 찾을 수 없습니다.' });
    }
    res.json(pet);
});

app.get('/api/reviews', (req, res) => {
    console.log('GET /api/reviews 요청 수신');
    res.json(reviews);
});


// ----------------------------------------------------
// (B) 🚨 사용자 인증 API (회원가입 / 로그인)
// ----------------------------------------------------

// [NEW] 1. 회원가입 API (POST /api/register)
app.post('/api/register', async (req, res) => {
    const { username, password, email, nickname } = req.body;

    // (1) 유효성 검사
    if (!username || !password || !email || !nickname) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    try {
        // (2) 아이디(username) 중복 확인
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' }); // 409: Conflict
        }
        
        // (3) 비밀번호 암호화 (bcryptjs 사용)
        const hashedPassword = await bcrypt.hash(password, 10); // 10: salt rounds

        // (4) DB에 사용자 저장
        const sql = `
            INSERT INTO users (username, password, email, nickname) 
            VALUES (?, ?, ?, ?)
        `;
        await pool.query(sql, [username, hashedPassword, email, nickname]);

        console.log(`✅ 새 사용자 회원가입 완료 (ID: ${username})`);
        res.status(201).json({ message: '회원가입이 성공적으로 완료되었습니다.' });

    } catch (error) {
        console.error('DB 삽입 중 오류 발생 (POST /api/register):', error);
        res.status(500).json({ message: '서버 오류: 회원가입에 실패했습니다.' });
    }
});


// [NEW] 2. 로그인 API (POST /api/login)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
    }

    try {
        // (1) 아이디(username)로 사용자 찾기
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (users.length === 0) {
            // 해당 아이디가 없음
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' }); // 401: Unauthorized
        }

        const user = users[0];

        // (2) 비밀번호 비교 (암호화된 DB 비밀번호와 대조)
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            // 비밀번호 불일치
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
        
        // (3) 로그인 성공
        // (실제 서비스에서는 JWT 토큰 등을 발급해야 합니다)
        console.log(`✅ 사용자 로그인 성공 (ID: ${user.username})`);
        res.json({ 
            message: '로그인 성공!',
            user: { // 프론트엔드에서 사용할 사용자 정보 전달
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                email: user.email
            }
        });

    } catch (error) {
        console.error('DB 조회 중 오류 발생 (POST /api/login):', error);
        res.status(500).json({ message: '서버 오류: 로그인에 실패했습니다.' });
    }
});


// ----------------------------------------------------
// (C) 게시판 API (posts)
// ----------------------------------------------------

// 2. 게시판 API (목록 읽기 - GET)
app.get('/api/posts', async (req, res) => {
    console.log('GET /api/posts 요청 수신');
    try {
        const sql = `
            SELECT p.*, COUNT(c.id) AS comments 
            FROM posts p
            LEFT JOIN comments c ON p.id = c.postId
            GROUP BY p.id
            ORDER BY p.createdAt DESC;
        `;
        const [rows] = await pool.query(sql);
        
        const postsWithParsedLikes = rows.map(post => ({
            ...post,
            likedUsers: post.likedUsers ? JSON.parse(post.likedUsers) : []
        }));
        res.json(postsWithParsedLikes);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/posts):', error);
        res.status(500).json({ message: '서버 오류: 게시글 목록을 불러오지 못했습니다.' });
    }
});

// 3. 게시판 API (상세 조회 - GET)
app.get('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
        return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' });
    }
    
    try {
        await pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [postId]);

        const sql = `
            SELECT p.*, COUNT(c.id) AS comments 
            FROM posts p
            LEFT JOIN comments c ON p.id = c.postId
            WHERE p.id = ?
            GROUP BY p.id;
        `;
        const [rows] = await pool.query(sql, [postId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        
        const post = rows[0];
        post.likedUsers = post.likedUsers ? JSON.parse(post.likedUsers) : [];
        
        res.json(post);
    } catch (error) {
        console.error('DB 조회/업데이트 중 오류 발생 (GET /api/posts/:id):', error);
        res.status(500).json({ message: '서버 오류: 게시글을 불러오지 못했습니다.' });
    }
});

// 4. 게시판 API (글쓰기 - POST)
app.post('/api/posts', async (req, res) => {
    const { title, content, author = '익명사용자', category = '자유게시판' } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해야 합니다.' });
    }

    const sql = `
        INSERT INTO posts (title, content, author, category, likedUsers) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const initialLikedUsers = JSON.stringify([]); 

    try {
        const [result] = await pool.query(sql, [title, content, author, category, initialLikedUsers]);
        const newPostId = result.insertId;
        
        const [newPostRows] = await pool.query('SELECT * FROM posts WHERE id = ?', [newPostId]);
        
        res.status(201).json({ 
            message: '게시글이 성공적으로 등록되었습니다.', 
            post: newPostRows[0] 
        });
    } catch (error) {
        console.error('DB 삽입 중 오류 발생 (POST /api/posts):', error);
        res.status(500).json({ message: '서버 오류: 게시글을 등록하지 못했습니다.' });
    }
});

// 5. 게시판 API (좋아요 토글 - PUT)
app.put('/api/posts/:id/like', async (req, res) => {
    const postId = parseInt(req.params.id);
    const { userId = 'user_default' } = req.body;

    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }
    if (!userId) { return res.status(400).json({ message: '사용자 ID가 필요합니다.' }); }

    try {
        const [rows] = await pool.query('SELECT likes, likedUsers FROM posts WHERE id = ?', [postId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        let { likes, likedUsers } = rows[0];
        likedUsers = likedUsers ? JSON.parse(likedUsers) : []; 

        let isLiked = false;
        const userIndex = likedUsers.indexOf(userId);

        if (userIndex === -1) { // 좋아요 추가
            likedUsers.push(userId);
            likes = (likes || 0) + 1;
            isLiked = true;
        } else { // 좋아요 취소
            likedUsers.splice(userIndex, 1);
            likes = Math.max(0, (likes || 1) - 1);
            isLiked = false;
        }

        await pool.query('UPDATE posts SET likes = ?, likedUsers = ? WHERE id = ?', [likes, JSON.stringify(likedUsers), postId]);

        res.json({ likes: likes, isLiked: isLiked, message: `좋아요가 ${isLiked ? '반영' : '취소'}되었습니다.` });
    } catch (error) {
        console.error('DB 업데이트 중 오류 발생 (PUT /api/posts/:id/like):', error);
        res.status(500).json({ message: '서버 오류: 좋아요 처리에 실패했습니다.' });
    }
});

// 6. 게시판 API (게시글 수정 - PUT)
app.put('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    const { title, content, category } = req.body;

    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }

    const fieldsToUpdate = {};
    if (title !== undefined) fieldsToUpdate.title = title;
    if (content !== undefined) fieldsToUpdate.content = content;
    if (category !== undefined) fieldsToUpdate.category = category;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: '수정할 내용이 없습니다.' });
    }

    const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE posts SET ${setClause} WHERE id = ?`;
    const values = [...Object.values(fieldsToUpdate), postId];

    try {
        const [result] = await pool.query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없거나 수정된 내용이 없습니다.' });
        }
        
        const [updatedPostRows] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
        
        res.json({ post: updatedPostRows[0], message: '게시글이 수정되었습니다.' });
    } catch (error) {
        console.error('DB 업데이트 중 오류 발생 (PUT /api/posts/:id):', error);
        res.status(500).json({ message: '서버 오류: 게시글 수정에 실패했습니다.' });
    }
});

// 7. 게시판 API (게시글 삭제 - DELETE)
app.delete('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }

    try {
        const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [postId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '삭제할 게시글을 찾을 수 없습니다.' });
        }
        res.json({ message: '게시글이 삭제되었습니다.', deletedId: postId });
    } catch (error) {
        console.error('DB 삭제 중 오류 발생 (DELETE /api/posts/:id):', error);
        res.status(500).json({ message: '서버 오류: 게시글 삭제에 실패했습니다.' });
    }
});


// ----------------------------------------------------
// (D) 댓글 API (comments)
// ----------------------------------------------------

// 9. 댓글 목록 조회 (GET /api/posts/:postId/comments)
app.get('/api/posts/:postId/comments', async (req, res) => {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }

    try {
        const sql = 'SELECT * FROM comments WHERE postId = ? ORDER BY createdAt DESC';
        const [rows] = await pool.query(sql, [postId]);
        res.json(rows);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/posts/:postId/comments):', error);
        res.status(500).json({ message: '서버 오류: 댓글 목록을 불러오지 못했습니다.' });
    }
});

// 10. 댓글 작성 (POST /api/posts/:postId/comments)
app.post('/api/posts/:postId/comments', async (req, res) => {
    const postId = parseInt(req.params.postId);
    const { content, author = '익명사용자' } = req.body;

    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    const sql = 'INSERT INTO comments (postId, author, content) VALUES (?, ?, ?)';
    try {
        const [result] = await pool.query(sql, [postId, author, content]);
        const newCommentId = result.insertId;
        
        const [newCommentRows] = await pool.query('SELECT * FROM comments WHERE id = ?', [newCommentId]);
        
        console.log(`✅ 게시글 ${postId}에 새로운 댓글 (ID: ${newCommentId}) DB 저장됨.`);
        res.status(201).json({ message: '댓글이 성공적으로 작성되었습니다.', comment: newCommentRows[0] });
    } catch (error) {
        console.error('DB 삽입 중 오류 발생 (POST /api/posts/:postId/comments):', error);
        res.status(500).json({ message: '서버 오류: 댓글 작성에 실패했습니다.' });
    }
});


/* ====================================================
 * * 6. DB 초기화 및 서버 시작 (가장 아래에 위치)
 * * ==================================================== */

/**
 * [HELPER] DB에 컬럼이 없으면 추가하는 함수
 */
async function safeAddColumn(tableName, columnName, columnDefinition) {
    try {
        const alterSql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`;
        await pool.query(alterSql);
        console.log(`✅ '${columnName}' 컬럼이 성공적으로 추가되었습니다.`);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`ℹ️ '${columnName}' 컬럼이 이미 존재합니다. (초기화 건너뜀)`);
        } else {
            console.error(`❌ '${columnName}' 컬럼 추가 중 오류 발생:`, error.sqlMessage || error.message);
            throw error; 
        }
    }
}

/**
 * [MAIN] DB를 초기화하고 필요한 테이블/컬럼을 확인하는 함수
 */
async function initializeDatabase() {
    try {
        await pool.query('SELECT 1 + 1 AS solution');
        console.log('✅ MySQL DB 연결 성공');

        // 1. posts 테이블 생성 (없으면)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                author VARCHAR(100) DEFAULT '익명사용자',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('ℹ️ posts 테이블 확인/생성 완료.');

        // 2. comments 테이블 생성 (없으면)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                postId INT NOT NULL,
                author VARCHAR(100) DEFAULT '익명사용자',
                content TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
            );
        `);
        console.log('ℹ️ comments 테이블 확인/생성 완료.');

        // 3. [NEW] 🚨 users 테이블 생성 (없으면) - 회원가입/로그인용
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                nickname VARCHAR(100) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('ℹ️ users 테이블 확인/생성 완료.');


        // 4. [중요] posts 테이블에 빠진 컬럼들 안전하게 추가
        await safeAddColumn('posts', 'category', "VARCHAR(50) DEFAULT '자유게시판'");
        await safeAddColumn('posts', 'views', "INT DEFAULT 0");
        await safeAddColumn('posts', 'likes', "INT DEFAULT 0");
        await safeAddColumn('posts', 'comments', "INT DEFAULT 0"); // 🚨 'comments' 컬럼 추가
        await safeAddColumn('posts', 'isNotice', "BOOLEAN DEFAULT FALSE");
        await safeAddColumn('posts', 'likedUsers', "TEXT");

        console.log('✅ 모든 테이블과 컬럼 구조가 최신 상태입니다.');

    } catch (error) {
        console.error('❌ DB 초기화 중 치명적인 오류 발생:', error);
        throw error; // 에러를 다시 던져서 서버 시작을 막음
    }
}

/**
 * [MAIN] 서버 실행 로직
 */
async function startServer() {
    try {
        // 1. DB 초기화/검사 먼저 실행 (await로 대기)
        await initializeDatabase();
        
        // 2. DB 초기화 성공 시 서버 실행
        app.listen(PORT, () => {
            console.log(`✅ Node.js 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
        });

    } catch (error) {
        console.error("❌ 치명적인 DB 오류로 서버를 시작할 수 없습니다. 애플리케이션을 종료합니다.");
        process.exit(1); // 오류 발생 시 프로세스 종료
    }
}

// [M] 서버 시작 함수 호출
startServer();