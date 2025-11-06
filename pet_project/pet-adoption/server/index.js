const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// [필수] MySQL DB 연동을 위한 mysql2 라이브러리 및 커넥션 풀
const mysql = require('mysql2/promise');

// [필수] DB 커넥션 풀 생성
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'kiwu!@', // 🚨 비밀번호를 실제 DB 비밀번호로 변경하세요!
    database: 'pet_project_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ----------------------------------------------------
// 임시 인메모리 데이터 (DB 연동되지 않은 API들을 위한 더미 데이터)
// ----------------------------------------------------
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
    { id: 4, productName: "고양이 스크래쳐", category: "장난감", rating: 5, author: "긁적이집사", date: "2024-01-17", content: "고양이가 너무 좋아해서 가구를 안 긁어요!", image: "https://placehold.co/300x300/DDA0DD/ffffff?text=Cat+Scratcher", likes: 56, comments: 0 },
    { id: 5, productName: "강아지 산책 가방", category: "외출용품", rating: 4, author: "산책러버", date: "2024-01-16", content: "소형견에게 딱 맞아요.", image: "https://placehold.co/300x300/F0E68C/ffffff?text=Pet+Carrier", likes: 31, comments: 0 },
    { id: 6, productName: "고양이 자동 화장실", category: "위생용품", rating: 5, author: "편한집사", date: "2024-01-15", content: "청소가 너무 편해졌어요.", image: "https://placehold.co/300x300/FFD700/ffffff?text=Auto+Litter", likes: 67, comments: 0 },
    { id: 7, productName: "강아지 치석제거 장난감", category: "장난감", rating: 4, author: "건강지킴이", date: "2024-01-14", content: "놀면서 양치 효과까지.", image: "https://placehold.co/300x300/FFA07A/ffffff?text=Dental+Toy", likes: 23, comments: 0 },
    { id: 8, productName: "고양이 영양 간식", category: "간식", rating: 5, author: "맛있냥", date: "2024-01-13", content: "기호성이 정말 좋아요.", image: "https://placehold.co/300x300/E6E6FA/ffffff?text=Cat+Treats", likes: 45, comments: 0 },
];

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 0. 서버 실행 확인용 테스트 경로 (루트 경로)
// ----------------------------------------------------
app.get('/', (req, res) => {
    res.send('Node.js 서버가 MySQL DB와 함께 성공적으로 실행 중입니다! 🎉');
});

// ----------------------------------------------------
// 1. 입양 공고 API (읽기 - GET)
// ----------------------------------------------------
app.get('/api/adoption', (req, res) => {
    console.log('GET /api/adoption 요청 수신');
    res.json(adoptionPets);
});

// ----------------------------------------------------
// 1-2. 입양 공고 API (상세 조회 - GET) 🆕
// ----------------------------------------------------
app.get('/api/adoption/:id', (req, res) => {
    const petId = parseInt(req.params.id);
    console.log(`GET /api/adoption/${petId} 요청 수신`);
    const pet = adoptionPets.find(p => p.id === petId);

    if (!pet) {
        return res.status(404).json({ message: '해당 동물을 찾을 수 없습니다.' });
    }
    console.log(`✅ 동물 ID ${petId} 조회 성공 (이름: ${pet.name})`);
    res.json(pet);
});


// ====================================================
// 💡 게시판 API (MySQL DB 연동)
// ====================================================

// ----------------------------------------------------
// 2. 게시판 API (목록 읽기 - GET)
// ----------------------------------------------------
app.get('/api/posts', async (req, res) => {
    console.log('GET /api/posts 요청 수신');
    try {
        // posts 테이블 데이터와 각 post에 달린 댓글 수를 함께 조회
        const sql = `
            SELECT p.*, COUNT(c.id) AS comments 
            FROM posts p
            LEFT JOIN comments c ON p.id = c.postId
            GROUP BY p.id
            ORDER BY p.createdAt DESC;
        `;
        const [rows] = await pool.query(sql);
        
        // likedUsers는 DB에서 TEXT로 저장된 JSON 문자열이므로 파싱
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

// ----------------------------------------------------
// 3. 게시판 API (상세 조회 - GET)
// ----------------------------------------------------
app.get('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    console.log(`GET /api/posts/${postId} 요청 수신`);

    if (isNaN(postId)) {
        return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' });
    }

    try {
        // 1. 조회수 증가 쿼리 실행
        await pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [postId]);

        // 2. 게시글 상세 정보와 댓글 수 조회
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
        // likedUsers 파싱
        post.likedUsers = post.likedUsers ? JSON.parse(post.likedUsers) : [];
        
        console.log(`✅ 게시글 ID ${postId} 조회 성공 (조회수 업데이트됨)`);
        res.json(post);

    } catch (error) {
        console.error('DB 조회/업데이트 중 오류 발생 (GET /api/posts/:id):', error);
        res.status(500).json({ message: '서버 오류: 게시글을 불러오지 못했습니다.' });
    }
});

// ----------------------------------------------------
// 4. 게시판 API (글쓰기 - POST)
// ----------------------------------------------------
app.post('/api/posts', async (req, res) => {
    const { title, content, author = '익명사용자', category = '자유게시판' } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해야 합니다.' });
    }

    const sql = `
        INSERT INTO posts (title, content, author, category, likedUsers) 
        VALUES (?, ?, ?, ?, ?)
    `;
    // likedUsers는 빈 배열의 JSON 문자열 형태로 저장
    const initialLikedUsers = JSON.stringify([]); 

    try {
        const [result] = await pool.query(sql, [title, content, author, category, initialLikedUsers]);
        const newPostId = result.insertId;
        console.log(`✅ 새 게시글 DB 저장 완료 (ID: ${newPostId})`);

        // 방금 삽입된 게시글 정보 반환 (선택 사항)
        const [newPostRows] = await pool.query('SELECT * FROM posts WHERE id = ?', [newPostId]);
        
        res.status(201).json({ 
            message: '게시글이 성공적으로 등록되었습니다.', 
            post: newPostRows[0] // 새로 생성된 게시글 정보 포함
        });
    } catch (error) {
        console.error('DB 삽입 중 오류 발생 (POST /api/posts):', error);
        res.status(500).json({ message: '서버 오류: 게시글을 등록하지 못했습니다.' });
    }
});

// ----------------------------------------------------
// 5. 게시판 API (좋아요 토글 - PUT)
// ----------------------------------------------------
app.put('/api/posts/:id/like', async (req, res) => {
    const postId = parseInt(req.params.id);
    const { userId = 'user_default' } = req.body;

    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }
    if (!userId) { return res.status(400).json({ message: '사용자 ID가 필요합니다.' }); }

    try {
        // 1. 현재 게시글 정보 조회 (좋아요 수, 좋아요 누른 사용자 목록)
        const [rows] = await pool.query('SELECT likes, likedUsers FROM posts WHERE id = ?', [postId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        let { likes, likedUsers } = rows[0];
        likedUsers = likedUsers ? JSON.parse(likedUsers) : []; // JSON 문자열 파싱

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

        // 2. 변경된 좋아요 수와 사용자 목록 DB 업데이트
        await pool.query('UPDATE posts SET likes = ?, likedUsers = ? WHERE id = ?', [likes, JSON.stringify(likedUsers), postId]);

        console.log(`✅ 게시글 ID ${postId} 좋아요 ${isLiked ? '추가' : '취소'} (현재: ${likes})`);
        res.json({ likes: likes, isLiked: isLiked, message: `좋아요가 ${isLiked ? '반영' : '취소'}되었습니다.` });

    } catch (error) {
        console.error('DB 업데이트 중 오류 발생 (PUT /api/posts/:id/like):', error);
        res.status(500).json({ message: '서버 오류: 좋아요 처리에 실패했습니다.' });
    }
});

// ----------------------------------------------------
// 6. 게시판 API (게시글 수정 - PUT)
// ----------------------------------------------------
app.put('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    const { title, content, category } = req.body;

    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }

    // 업데이트할 필드만 동적으로 구성
    const fieldsToUpdate = {};
    if (title !== undefined) fieldsToUpdate.title = title;
    if (content !== undefined) fieldsToUpdate.content = content;
    if (category !== undefined) fieldsToUpdate.category = category;
    
    // 업데이트할 내용이 없으면 에러 반환
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: '수정할 내용이 없습니다.' });
    }

    // SQL 쿼리 생성 (SET 부분 동적 생성)
    const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE posts SET ${setClause} WHERE id = ?`;
    const values = [...Object.values(fieldsToUpdate), postId];

    try {
        const [result] = await pool.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없거나 수정된 내용이 없습니다.' });
        }
        
        // 수정된 게시글 정보 다시 조회하여 반환
        const [updatedPostRows] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
        
        console.log(`✅ 게시글 ID ${postId} DB 수정 완료`);
        res.json({ post: updatedPostRows[0], message: '게시글이 수정되었습니다.' });

    } catch (error) {
        console.error('DB 업데이트 중 오류 발생 (PUT /api/posts/:id):', error);
        res.status(500).json({ message: '서버 오류: 게시글 수정에 실패했습니다.' });
    }
});

// ----------------------------------------------------
// 7. 게시판 API (게시글 삭제 - DELETE)
// ----------------------------------------------------
app.delete('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }

    try {
        // DB에서 해당 ID의 게시글 삭제 (댓글은 FOREIGN KEY CASCADE로 자동 삭제됨)
        const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [postId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '삭제할 게시글을 찾을 수 없습니다.' });
        }

        console.log(`✅ 게시글 ID ${postId} DB 삭제 완료`);
        res.json({ message: '게시글이 삭제되었습니다.', deletedId: postId });

    } catch (error) {
        console.error('DB 삭제 중 오류 발생 (DELETE /api/posts/:id):', error);
        res.status(500).json({ message: '서버 오류: 게시글 삭제에 실패했습니다.' });
    }
});


// ====================================================
// 💡 댓글 API (MySQL DB 연동)
// ====================================================

// ----------------------------------------------------
// 9. 댓글 목록 조회 (GET /api/posts/:postId/comments)
// ----------------------------------------------------
app.get('/api/posts/:postId/comments', async (req, res) => {
    const postId = parseInt(req.params.postId);

    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }

    try {
        // 해당 postId를 가진 댓글들을 최신순으로 조회
        const sql = 'SELECT * FROM comments WHERE postId = ? ORDER BY createdAt DESC';
        const [rows] = await pool.query(sql, [postId]);

        console.log(`✅ 게시글 ${postId}의 댓글 ${rows.length}개 DB 조회됨.`);
        res.json(rows);

    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/posts/:postId/comments):', error);
        res.status(500).json({ message: '서버 오류: 댓글 목록을 불러오지 못했습니다.' });
    }
});

// ----------------------------------------------------
// 10. 댓글 작성 (POST /api/posts/:postId/comments)
// ----------------------------------------------------
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
        
        // 방금 삽입된 댓글 정보 조회
        const [newCommentRows] = await pool.query('SELECT * FROM comments WHERE id = ?', [newCommentId]);

        // 게시글의 댓글 수 업데이트 (DB에서 직접)
        // [수정] 댓글 수 집계는 목록/상세보기에서 LEFT JOIN으로 하므로 이 로직은 제거 가능
        // await pool.query('UPDATE posts SET comments = comments + 1 WHERE id = ?', [postId]);

        console.log(`✅ 게시글 ${postId}에 새로운 댓글 (ID: ${newCommentId}) DB 저장됨.`);
        res.status(201).json({ message: '댓글이 성공적으로 작성되었습니다.', comment: newCommentRows[0] });

    } catch (error) {
        console.error('DB 삽입 중 오류 발생 (POST /api/posts/:postId/comments):', error);
        res.status(500).json({ message: '서버 오류: 댓글 작성에 실패했습니다.' });
    }
});

// ----------------------------------------------------
// 8. 펫 용품 리뷰 API (목록 읽기 - GET)
// ----------------------------------------------------
app.get('/api/reviews', (req, res) => {
    console.log('GET /api/reviews 요청 수신');
    res.json(reviews);
});


// ----------------------------------------------------
// [수정] DB 초기화 및 서버 시작 로직 (가장 아래로 이동)
// ----------------------------------------------------

/**
 * [HELPER] DB에 컬럼이 없으면 추가하는 함수
 * @param {string} tableName - 테이블 이름
 * @param {string} columnName - 추가할 컬럼 이름
 * @param {string} columnDefinition - 컬럼 정의 (예: VARCHAR(255) NOT NULL)
 */
async function safeAddColumn(tableName, columnName, columnDefinition) {
    try {
        // 컬럼 추가 시도
        const alterSql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`;
        await pool.query(alterSql);
        console.log(`✅ '${columnName}' 컬럼이 성공적으로 추가되었습니다.`);
    } catch (error) {
        // [중요] 에러가 "Duplicate column name" (ER_DUP_FIELDNAME)이면,
        // 이미 컬럼이 존재한다는 뜻이므로, 이 에러는 무시합니다.
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`ℹ️ '${columnName}' 컬럼이 이미 존재합니다. (초기화 건너뜀)`);
        } else {
            // 그 외의 다른 에러라면 (ex: ER_PARSE_ERROR, ER_NO_SUCH_TABLE)
            // 서버를 중지시켜야 하므로 에러를 다시 던집니다.
            console.error(`❌ '${columnName}' 컬럼 추가 중 오류 발생:`, error.sqlMessage || error.message);
            throw error; // 서버 시작을 중지시킴
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

        // 3. [중요] posts 테이블에 빠진 컬럼들 안전하게 추가
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