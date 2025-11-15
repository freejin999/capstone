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
// 🚨 [수정] 입양 공고는 이제 DB를 사용하므로 더미 데이터(adoptionPets)를 삭제합니다.
// 🚨 리뷰 더미 데이터는 이제 DB를 사용하므로 'reviews' 변수 (const reviews = [...])를 삭제합니다.


/* ====================================================
 * * 5. API 라우트 (Routes)
 * * ==================================================== */

// ----------------------------------------------------
// (A) 테스트 API
// ----------------------------------------------------
app.get('/', (req, res) => {
    res.send('Node.js 서버가 MySQL DB와 함께 성공적으로 실행 중입니다! 🎉');
});


// ----------------------------------------------------
// (H) 🚨 입양 공고 API (NEW) - (B) 섹션 위로 이동 (가독성)
// ----------------------------------------------------

// [수정] 1. 입양 공고 목록 (GET /api/adoption) - DB 연동
app.get('/api/adoption', async (req, res) => {
    console.log('GET /api/adoption 요청 수신 (DB)');
    try {
        const sql = `
            SELECT a.*, u.nickname AS authorNickname
            FROM adoption_posts a
            LEFT JOIN users u ON a.userId = u.id
            ORDER BY a.createdAt DESC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/adoption):', error);
        res.status(500).json({ message: '서버 오류: 공고 목록을 불러오지 못했습니다.' });
    }
});

// [수정] 1-2. 입양 공고 상세 (GET /api/adoption/:id) - DB 연동
app.get('/api/adoption/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`GET /api/adoption/${id} 요청 수신 (DB)`);
    try {
        const sql = `
            SELECT a.*, u.nickname AS authorNickname
            FROM adoption_posts a
            LEFT JOIN users u ON a.userId = u.id
            WHERE a.id = ?
        `;
        const [posts] = await pool.query(sql, [id]);
        if (posts.length === 0) {
            return res.status(404).json({ message: "공고를 찾을 수 없습니다." });
        }
        res.json(posts[0]);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/adoption/:id):', error);
        res.status(500).json({ message: '서버 오류: 공고를 불러오지 못했습니다.' });
    }
});

// 25. [NEW] 입양 공고 작성 (POST /api/adoption)
app.post('/api/adoption', async (req, res) => {
    const { name, species, breed, age, gender, size, region, description, image, userId, author, authorNickname } = req.body;
    
    if (!name || !species || !breed || !age || !gender || !size || !region || !description || !userId || !author || !authorNickname) {
        console.warn('누락된 필드:', { name, species, breed, age, gender, size, region, description, userId, author, authorNickname });
        return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }
    try {
        const sql = `
            INSERT INTO adoption_posts (name, species, breed, age, gender, size, region, description, image, userId, author, authorNickname, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '입양가능')
        `;
        const [result] = await pool.query(sql, [name, species, breed, age, gender, size, region, description, image || null, userId, author, authorNickname]);
        res.status(201).json({ message: '입양 공고가 성공적으로 등록되었습니다.', postId: result.insertId });
    } catch (error) {
        console.error('DB 삽입 중 오류 발생 (POST /api/adoption):', error);
        res.status(500).json({ message: '서버 오류: 공고 등록에 실패했습니다.' });
    }
});

// 26. [NEW] 입양 공고 수정 (PUT /api/adoption/:id)
app.put('/api/adoption/:id', async (req, res) => {
    const { id } = req.params;
    const { name, species, breed, age, gender, size, region, description, image, status, userId } = req.body;

    if (!name || !species || !breed || !age || !gender || !size || !region || !description || !status || !userId) {
        return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }
    try {
        const sql = `
            UPDATE adoption_posts 
            SET name = ?, species = ?, breed = ?, age = ?, gender = ?, size = ?, region = ?, description = ?, image = ?, status = ?
            WHERE id = ? AND userId = ?
        `;
        const [result] = await pool.query(sql, [name, species, breed, age, gender, size, region, description, image || null, status, id, userId]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '공고를 수정할 권한이 없거나 해당 공고를 찾을 수 없습니다.' });
        }
        res.json({ message: '공고가 성공적으로 수정되었습니다.' });
    } catch (error) {
        console.error('DB 업데이트 중 오류 발생 (PUT /api/adoption/:id):', error);
        res.status(500).json({ message: '서버 오류: 공고 수정에 실패했습니다.' });
    }
});

// 27. [NEW] 입양 공고 삭제 (DELETE /api/adoption/:id)
app.delete('/api/adoption/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; 
    if (!userId) {
        return res.status(400).json({ message: '본인 확인을 위한 사용자 ID가 필요합니다.' });
    }
    try {
        const sql = 'DELETE FROM adoption_posts WHERE id = ? AND userId = ?';
        const [result] = await pool.query(sql, [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '공고를 삭제할 권한이 없거나 해당 공고를 찾을 수 없습니다.' });
        }
        res.json({ message: '공고가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('DB 삭제 중 오류 발생 (DELETE /api/adoption/:id):', error);
        res.status(500).json({ message: '서버 오류: 공고 삭제에 실패했습니다.' });
    }
});

// 28. [NEW] 입양 신청 (POST /api/adoption/apply)
app.post('/api/adoption/apply', async (req, res) => {
    const { postId, userId, username, petName } = req.body;
    if (!postId || !userId || !username || !petName) {
        return res.status(400).json({ message: "신청 정보가 누락되었습니다." });
    }
    try {
        const sql = `
            INSERT INTO adoption_applications (postId, userId, username, petName, status)
            VALUES (?, ?, ?, ?, '신청완료')
        `;
        await pool.query(sql, [postId, userId, username, petName]);
        res.status(201).json({ message: '입양 신청이 완료되었습니다.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '이미 이 공고에 입양 신청을 하셨습니다.' });
        }
        console.error('DB 삽입 중 오류 발생 (POST /api/adoption/apply):', error);
        res.status(500).json({ message: '서버 오류: 입양 신청에 실패했습니다.' });
    }
});

// 29. [NEW] '내 입양 신청 내역' 조회 (GET /api/applications/:username)
app.get('/api/applications/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const sql = `
            SELECT a.*, p.region AS shelter, p.image AS petImage
            FROM adoption_applications a
            JOIN adoption_posts p ON a.postId = p.id
            WHERE a.username = ?
            ORDER BY a.createdAt DESC
        `;
        const [applications] = await pool.query(sql, [username]);
        res.json(applications);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/applications/:username):', error);
        res.status(500).json({ message: '서버 오류: 신청 내역을 불러오지 못했습니다.' });
    }
});


// ----------------------------------------------------
// (B) 사용자 인증 API (회원가입 / 로그인)
// ----------------------------------------------------

// 1. 회원가입 API (POST /api/register)
app.post('/api/register', async (req, res) => {
    const { username, password, email, nickname } = req.body;
    if (!username || !password || !email || !nickname) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }
    try {
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUsers.length > 0) {
            if (existingUsers[0].username === username) {
                return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' }); 
            }
            if (existingUsers[0].email === email) {
                return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10); 
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


// 2. 로그인 API (POST /api/login)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
    }
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' }); 
        }
        const user = users[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
        console.log(`✅ 사용자 로그인 성공 (ID: ${user.username})`);
        res.json({ 
            message: '로그인 성공!',
            user: { 
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

// 🌟 [핵심 수정 1] 게시글 작성 API (isNotice 추가)
app.post('/api/posts', async (req, res) => {
    const { title, content, author = '익명사용자', category = '자유게시판' } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해야 합니다.' });
    }

    // 🌟 [추가] '공지사항' 카테고리면 isNotice 플래그를 true(1)로 설정
    const isNotice = (category === '공지사항');

    const sql = `
        INSERT INTO posts (title, content, author, category, likedUsers, isNotice) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const initialLikedUsers = JSON.stringify([]); 

    try {
        // 🌟 [수정] isNotice를 SQL 쿼리에 추가
        const [result] = await pool.query(sql, [title, content, author, category, initialLikedUsers, isNotice]);
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

app.put('/api/posts/:id/like', async (req, res) => {
    const postId = parseInt(req.params.id);
    const { userId } = req.body; 
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
        if (userIndex === -1) { 
            likedUsers.push(userId);
            likes = (likes || 0) + 1;
            isLiked = true;
        } else { 
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

// 🌟 [핵심 수정 3 - 보너스] 게시글 삭제 API (ProfileManagement.jsx와 호환되도록)
app.delete('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    // 🌟 [수정] ProfileManagement에서 보내는 `authorUsername`을 받음
    const { authorUsername } = req.body; 

    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }
    if (!authorUsername) { return res.status(400).json({ message: '본인 확인을 위한 사용자 ID가 필요합니다.' }); }

    try {
        // 🌟 [수정] author(username)가 일치하는지 확인하며 삭제
        const [result] = await pool.query('DELETE FROM posts WHERE id = ? AND author = ?', [postId, authorUsername]);

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '게시글을 삭제할 권한이 없거나 해당 글을 찾을 수 없습니다.' });
        }

        console.log(`✅ 게시글 ID ${postId} DB 삭제 완료`);
        res.json({ message: '게시글이 삭제되었습니다.', deletedId: postId });

    } catch (error) {
        console.error('DB 삭제 중 오류 발생 (DELETE /api/posts/:id):', error);
        res.status(500).json({ message: '서버 오류: 게시글 삭제에 실패했습니다.' });
    }
});


// ----------------------------------------------------
// (D) 댓글 API (comments)
// ----------------------------------------------------
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

// 🌟 [핵심 수정] 댓글 작성 API
app.post('/api/posts/:postId/comments', async (req, res) => {
    const postId = parseInt(req.params.postId);
    // 🌟 [수정] author(닉네임)와 authorUsername(고유ID)을 모두 받음
    const { content, author = '익명사용자', authorUsername = 'anonymous' } = req.body; 

    if (isNaN(postId)) { return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다.' }); }
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    // 🌟 [수정] authorUsername도 저장
    const sql = 'INSERT INTO comments (postId, author, content, authorUsername) VALUES (?, ?, ?, ?)';
    try {
        // 🌟 [수정] authorUsername 추가
        const [result] = await pool.query(sql, [postId, author, content, authorUsername]);
        const newCommentId = result.insertId;
        
        const [newCommentRows] = await pool.query('SELECT * FROM comments WHERE id = ?', [newCommentId]);
        
        console.log(`✅ 게시글 ${postId}에 새로운 댓글 (ID: ${newCommentId}) DB 저장됨.`);
        res.status(201).json({ message: '댓글이 성공적으로 작성되었습니다.', comment: newCommentRows[0] });
    } catch (error) {
        console.error('DB 삽입 중 오류 발생 (POST /api/posts/:postId/comments):', error);
        res.status(500).json({ message: '서버 오류: 댓글 작성에 실패했습니다.' });
    }
});

// 🌟 [NEW] 댓글 수정 (PUT /api/comments/:id)
app.put('/api/comments/:id', async (req, res) => {
    const { id } = req.params; // 댓글 ID
    const { content, authorUsername } = req.body; // 수정할 내용, 본인 확인용 ID

    if (!content || !authorUsername) {
        return res.status(400).json({ message: "내용과 사용자 ID가 필요합니다." });
    }
    
    try {
        const sql = `
            UPDATE comments 
            SET content = ? 
            WHERE id = ? AND authorUsername = ?
        `;
        const [result] = await pool.query(sql, [content, id, authorUsername]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '댓글을 수정할 권한이 없거나 해당 댓글을 찾을 수 없습니다.' });
        }
        res.json({ message: '댓글이 성공적으로 수정되었습니다.' });
    } catch (error) {
        console.error('DB 업데이트 중 오류 발생 (PUT /api/comments/:id):', error);
        res.status(500).json({ message: '서버 오류: 댓글 수정에 실패했습니다.' });
    }
});

// 🌟 [NEW] 댓글 삭제 (DELETE /api/comments/:id)
app.delete('/api/comments/:id', async (req, res) => {
    const { id } = req.params; // 댓글 ID
    const { authorUsername } = req.body; // 본인 확인용 ID

    if (!authorUsername) {
        return res.status(400).json({ message: "본인 확인을 위한 사용자 ID가 필요합니다." });
    }
    
    try {
        const sql = 'DELETE FROM comments WHERE id = ? AND authorUsername = ?';
        const [result] = await pool.query(sql, [id, authorUsername]);

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '댓글을 삭제할 권한이 없거나 해당 댓글을 찾을 수 없습니다.' });
        }
        res.json({ message: '댓글이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('DB 삭제 중 오류 발생 (DELETE /api/comments/:id):', error);
        res.status(500).json({ message: '서버 오류: 댓글 삭제에 실패했습니다.' });
    }
});

// ----------------------------------------------------
// (E) 사용자/마이페이지 API
// ----------------------------------------------------
app.get('/api/users/:username/posts', async (req, res) => {
    const { username } = req.params;
    try {
        const sql = `
            SELECT p.*, COUNT(c.id) AS comments 
            FROM posts p
            LEFT JOIN comments c ON p.id = c.postId
            WHERE p.author = ? 
            GROUP BY p.id
            ORDER BY p.createdAt DESC;
        `;
        const [rows] = await pool.query(sql, [username]);
        res.json(rows);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/users/:username/posts):', error);
        res.status(500).json({ message: '서버 오류: ' });
    }
});

// 🌟 [핵심 추가] '내가 쓴 댓글' 목록 조회 API
app.get('/api/users/username/:username/comments', async (req, res) => {
    const { username } = req.params;
    
    try {
        // 'authorUsername'(고유ID)를 기준으로 댓글을 조회하고,
        // LEFT JOIN으로 원본 게시글의 'title'과 'id'를 함께 가져옵니다.
        const sql = `
            SELECT 
                c.id, 
                c.content, 
                c.createdAt, 
                c.postId, 
                p.title AS postTitle 
            FROM comments c
            LEFT JOIN posts p ON c.postId = p.id
            WHERE c.authorUsername = ?
            ORDER BY c.createdAt DESC;
        `;
        const [rows] = await pool.query(sql, [username]);
        res.json(rows);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/users/username/:username/comments):', error);
        res.status(500).json({ message: '서버 오류: 댓글 내역을 불러오지 못했습니다.' });
    }
});


app.post('/api/users/check-nickname', async (req, res) => {
    const { nickname } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE nickname = ?', [nickname]);
        if (rows.length > 0) {
            res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
        } else {
            res.json({ message: '사용 가능한 닉네임입니다.' });
        }
    } catch (error) {
        res.status(500).json({ message: '서버 오류: 닉네임 확인에 실패했습니다.' });
    }
});

app.put('/api/users/profile', async (req, res) => {
    const { userId, nickname } = req.body;
    if (!userId || !nickname) {
        return res.status(400).json({ message: '사용자 ID와 닉네임이 필요합니다.' });
    }
    try {
        await pool.query('UPDATE users SET nickname = ? WHERE id = ?', [nickname, userId]);
        res.json({ message: '닉네임이 변경되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류: 닉네임 변경에 실패했습니다.' });
    }
});

app.put('/api/users/password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }
    try {
        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        const user = users[0];
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
        }
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, userId]);
        res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류: 비밀번호 변경에 실패했습니다.' });
    }
});

app.delete('/api/users/account', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: '사용자 ID가 필요합니다.' });
    }
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        res.json({ message: '회원 탈퇴가 완료되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류: 회원 탈퇴에 실패했습니다.' });
    }
});


// ----------------------------------------------------
// (F) 반려동물 일기 API
// ----------------------------------------------------
app.get('/api/diaries/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        const userId = users[0].id;
        const sql = 'SELECT * FROM diaries WHERE userId = ? ORDER BY createdAt DESC';
        const [diaries] = await pool.query(sql, [userId]);
        res.json(diaries);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/diaries/:username):', error);
        res.status(500).json({ message: '서버 오류: 일기 목록을 불러오지 못했습니다.' });
    }
});

app.get('/api/diaries/entry/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM diaries WHERE id = ?';
        const [diaries] = await pool.query(sql, [id]);
        if (diaries.length === 0) {
            return res.status(404).json({ message: "일기를 찾을 수 없습니다." });
        }
        res.json(diaries[0]);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/diaries/entry/:id):', error);
        res.status(500).json({ message: '서버 오류: 일기를 불러오지 못했습니다.' });
    }
});

app.post('/api/diaries', async (req, res) => {
    const { title, mood, content, userId } = req.body;
    if (!title || !mood || !content || !userId) {
        return res.status(400).json({ message: "모든 필드(title, mood, content, userId)가 필요합니다." });
    }
    try {
        const sql = `
            INSERT INTO diaries (title, mood, content, userId) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [title, mood, content, userId]);
        res.status(201).json({ message: '일기가 성공적으로 등록되었습니다.', diaryId: result.insertId });
    } catch (error) {
        console.error('DB 삽입 중 오류 발생 (POST /api/diaries):', error);
        res.status(500).json({ message: '서버 오류: 일기 등록에 실패했습니다.' });
    }
});

app.put('/api/diaries/:id', async (req, res) => {
    const { id } = req.params; 
    const { title, mood, content, userId } = req.body; 
    if (!title || !mood || !content || !userId) {
        return res.status(400).json({ message: "모든 필드(title, mood, content, userId)가 필요합니다." });
    }
    try {
        const sql = `
            UPDATE diaries 
            SET title = ?, mood = ?, content = ? 
            WHERE id = ? AND userId = ?
        `;
        const [result] = await pool.query(sql, [title, mood, content, id, userId]);
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '일기를 수정할 권한이 없거나 해당 일기를 찾을 수 없습니다.' });
        }
        res.json({ message: '일기가 성공적으로 수정되었습니다.' });
    } catch (error) {
        console.error('DB 업데이트 중 오류 발생 (PUT /api/diaries/:id):', error);
        res.status(500).json({ message: '서버 오류: 일기 수정에 실패했습니다.' });
    }
});

app.delete('/api/diaries/:id', async (req, res) => {
    const { id } = req.params; 
    const { userId } = req.body; 
    if (!userId) {
        return res.status(400).json({ message: '본인 확인을 위한 사용자 ID가 필요합니다.' });
    }
    try {
        const sql = 'DELETE FROM diaries WHERE id = ? AND userId = ?';
        const [result] = await pool.query(sql, [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '일기를 삭제할 권한이 없거나 해당 일기를 찾을 수 없습니다.' });
        }
        res.json({ message: '일기가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('DB 삭제 중 오류 발생 (DELETE /api/diaries/:id):', error);
        res.status(500).json({ message: '서버 오류: 일기 삭제에 실패했습니다.' });
    }
});


// ----------------------------------------------------
// (G) 펫 용품 리뷰 API
// ----------------------------------------------------

// [수정] 8. 리뷰 목록 (GET /api/reviews) - DB 연동
app.get('/api/reviews', async (req, res) => {
    console.log('GET /api/reviews 요청 수신 (DB)');
    try {
        const sql = `
            SELECT r.*, u.nickname AS authorNickname 
            FROM reviews r
            LEFT JOIN users u ON r.userId = u.id
            ORDER BY r.createdAt DESC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/reviews):', error);
        res.status(500).json({ message: '서버 오류: 리뷰 목록을 불러오지 못했습니다.' });
    }
});

// 21. 리뷰 1개 조회 (GET /api/reviews/entry/:id) - 수정용
app.get('/api/reviews/entry/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM reviews WHERE id = ?';
        const [reviews] = await pool.query(sql, [id]);
        if (reviews.length === 0) {
            return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
        }
        res.json(reviews[0]);
    } catch (error) {
        console.error('DB 조회 중 오류 발생 (GET /api/reviews/entry/:id):', error);
        res.status(500).json({ message: '서버 오류: 리뷰를 불러오지 못했습니다.' });
    }
});

// 22. 리뷰 작성 (POST /api/reviews)
app.post('/api/reviews', async (req, res) => {
    const { productName, category, rating, content, image, authorUsername, authorNickname, userId } = req.body;

    if (!productName || !category || !content || !authorUsername || !userId || !authorNickname || (rating === null || rating === undefined)) {
        console.warn('누락된 필드:', { productName, category, rating, content, authorUsername, authorNickname, userId });
        return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }

    try {
        const sql = `
            INSERT INTO reviews (productName, category, rating, content, image, author, authorNickname, userId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [productName, category, rating, content, image || null, authorUsername, authorNickname, userId]);
        res.status(201).json({ message: '리뷰가 성공적으로 등록되었습니다.', reviewId: result.insertId });
    } catch (error) {
        console.error('DB 삽입 중 오류 발생 (POST /api/reviews):', error);
        res.status(500).json({ message: '서버 오류: 리뷰 등록에 실패했습니다.' });
    }
});

// 23. 리뷰 수정 (PUT /api/reviews/:id)
app.put('/api/reviews/:id', async (req, res) => {
    const { id } = req.params;
    const { productName, category, rating, content, image, userId } = req.body;

    if (!productName || !category || !content || !userId || (rating === null || rating === undefined)) {
        return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }

    try {
        const sql = `
            UPDATE reviews 
            SET productName = ?, category = ?, rating = ?, content = ?, image = ?
            WHERE id = ? AND userId = ?
        `;
        const [result] = await pool.query(sql, [productName, category, rating, content, image || null, id, userId]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '리뷰를 수정할 권한이 없거나 해당 리뷰를 찾을 수 없습니다.' });
        }
        res.json({ message: '리뷰가 성공적으로 수정되었습니다.' });
    } catch (error) {
        console.error('DB 업데이트 중 오류 발생 (PUT /api/reviews/:id):', error);
        res.status(500).json({ message: '서버 오류: 리뷰 수정에 실패했습니다.' });
    }
});

// 24. 리뷰 삭제 (DELETE /api/reviews/:id)
app.delete('/api/reviews/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; 

    if (!userId) {
        return res.status(400).json({ message: '본인 확인을 위한 사용자 ID가 필요합니다.' });
    }

    try {
        const sql = 'DELETE FROM reviews WHERE id = ? AND userId = ?';
        const [result] = await pool.query(sql, [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '리뷰를 삭제할 권한이 없거나 해당 리뷰를 찾을 수 없습니다.' });
        }
        res.json({ message: '리뷰가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('DB 삭제 중 오류 발생 (DELETE /api/reviews/:id):', error);
        res.status(500).json({ message: '서버 오류: 리뷰 삭제에 실패했습니다.' });
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

        // 3. users 테이블 생성 (없으면)
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

        // 4. diaries 테이블 생성 (없으면)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS diaries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                mood VARCHAR(50),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('ℹ️ diaries 테이블 확인/생성 완료.');

        // 5. reviews 테이블 생성 (없으면)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                author VARCHAR(100) NOT NULL, 
                authorNickname VARCHAR(100) NOT NULL, 
                productName VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                rating INT NOT NULL,
                content TEXT NOT NULL,
                image VARCHAR(512),
                likes INT DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('ℹ️ reviews 테이블 확인/생성 완료.');
        
        // 6. [NEW] adoption_posts 테이블 생성 (입양 공고용)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS adoption_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                author VARCHAR(100) NOT NULL, 
                authorNickname VARCHAR(100) NOT NULL,
                name VARCHAR(100) NOT NULL,
                species VARCHAR(50),
                breed VARCHAR(100),
                age INT,
                gender VARCHAR(10),
                size VARCHAR(20),
                region VARCHAR(255),
                description TEXT NOT NULL,
                image VARCHAR(512),
                status VARCHAR(50) DEFAULT '입양가능',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('ℹ️ adoption_posts 테이블 확인/생성 완료.');

        // 7. [NEW] adoption_applications 테이블 생성 (입양 신청용)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS adoption_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                postId INT NOT NULL,
                userId INT NOT NULL,
                username VARCHAR(100) NOT NULL,
                petName VARCHAR(100) NOT NULL,
                status VARCHAR(50) DEFAULT '신청완료',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (postId) REFERENCES adoption_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_application (postId, userId)
            );
        `);
        console.log('ℹ️ adoption_applications 테이블 확인/생성 완료.');


        // 8. [중요] posts 테이블에 빠진 컬럼들 안전하게 추가
        await safeAddColumn('posts', 'category', "VARCHAR(50) DEFAULT '자유게시판'");
        await safeAddColumn('posts', 'views', "INT DEFAULT 0");
        await safeAddColumn('posts', 'likes', "INT DEFAULT 0");
        await safeAddColumn('posts', 'comments', "INT DEFAULT 0"); 
        await safeAddColumn('posts', 'isNotice', "BOOLEAN DEFAULT FALSE");
        await safeAddColumn('posts', 'likedUsers', "TEXT");

        // 9. [NEW] adoption_posts에 authorNickname 컬럼 추가 (이전 버전에 빠졌을 경우 대비)
        await safeAddColumn('adoption_posts', 'authorNickname', "VARCHAR(100) NOT NULL");
        
        // 10. [NEW] 🚨 comments 테이블에 authorUsername 컬럼 추가 (댓글 작성자 ID)
        await safeAddColumn('comments', 'authorUsername', "VARCHAR(100) DEFAULT 'anonymous'");


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