const express = require('express');
const app = express();
//hash(sha512) 암호화
var crypto = require('crypto');
//수정기능
// const methodOverride  = require('method-override');
// app.use(methodOverride('_method'));

//app.use : 미들웨어
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

app.use('/public', express.static('public'));
//쿠키
const cookieParser = require ('cookie-parser');
app.use(cookieParser());

//이미지 업로드 미들웨어
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, res,cb) {   //저장할 폴더 지정
        // cb(null,'./imageProfile');
        cb(null,"public/images/");
    },
    filename: function (req,file,cb) {
        console.log(file);

        // cb(null, file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8'));   //한글깨짐 방지
        const fileUtf8 = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const imageExt = path.extname(file.originalname);  //이미지 확장자 가져오기
        cb(null, path.basename(file.originalname = fileUtf8,imageExt) + "_" + Date.now() + imageExt);
    }
});
const upload = multer({storage: storage});
// app.use(express.static('uploads'));
// app.use(express.static('./uploadProfile'));


//그냥세션
const session = require('express-session');
// const MemoryStore = require("memorystore")(session);
// app.use(session({
//     // key: 'sid',
//     secret :'GttiginYagmur',
//     resave : false,  //세션아이디를 접속할때마다 발급하지 않는다
//     saveUninitialized : true,
//     // cookie: {
//     //     maxAge: 6000 // 쿠키 유효기간 24000 * 60 * 60
//     // }
// }));



//파일 세션 미들웨어 (session file store)
// const FileStore = require('session-file-store')(session);
// app.use(session({
//     secret :'secret',
//     resave : false,  //다시 저장안함
//     saveUninitialized : true,
//     store: new FileStore()      //FileStore 객체 생성
// }));

//mysql세션 미들웨어 (session file store MySql)
const MySQLStore = require('express-mysql-session')(session);
app.use(session({
    secret :'secret',
    resave : false,  //다시 저장안함
    saveUninitialized : true,
    cookie: {maxAge: 60000 * 2},
    store: new MySQLStore({             //FileStore 객체 생성
        host : '127.0.0.1',
        port : 3306,
        user : 'root',
        password : 'piaoxin123',
        database : 'node_project'
    })      
}));


//hasher
var bkpw = require('pbkdf2-password');


//list.html > list.ejs
app.set('view engine', 'ejs');  

//MySql 
const mysql = require('mysql');
// const { Row } = require('node-mysql');
// const { memoryStorage } = require('multer');
const conn = mysql.createConnection({
    // host : 'localhost',
    // user: 'root',
    // password : 'piaoxin123',
    // database : 'node_db'
    
    host : '127.0.0.1',
    port: '3306',
    user: 'root',
    password : 'piaoxin123',
    database : 'node_project'
});


//회원가입 라우터
app.get('/signup', function (req , res) {
    
    res.render('signup.ejs', {});

});

//회원가입
app.post('/signup', function (req , res) {

    console.log(req.body.email);
    console.log(req.body.pw);
    console.log(req.body.phonenumber);
    console.log(req.body.name);

	var email = req.body.email;
    var name = req.body.name;
    var phonenumber = req.body.phonenumber;
	var pw = req.body.pw;
    var pwConfirm = req.body.pwConfirm;

    if (pwConfirm != pw) {
        res.send("비밀번호 다시 확인해주세요");
    }

    else{
    const hashPassword = crypto.createHash('sha512').update(pw).digest('hex');
	var query = "SELECT user_email FROM user where user_email='" + email + "';"; // 중복 처리하기위한 쿼리
	conn.query(query, function (err, rows) {
		if (rows.length == 0) { // sql 제대로 연결되고 중복이 없는 경우
			var sql = {
				user_email: email,
				user_name: name,
				user_password: hashPassword,
                user_phonenumber : phonenumber
			};
			// create query 
			var query = conn.query('insert into user set ?', sql, function (err, rows) {
				if (err) throw err;
				else {
					res.send("가입성공");
			}
			});
		} else {
			// 이미 있음 
			res.send("중복ID");
		}
	});

    }
});

//로그인 라우터
app.get('/login', function (req , res) {
    
    res.render('login.ejs', {});

});

//로그인 post 처리
app.post('/login', function (req , res) {
    

    var email = req.body.email;
    var pw = req.body.pw;
    
    console.log(email);
    console.log(pw);

    var query = "select user_password, user_email from user where user_email='" + email + "';"
    console.log(query);
    conn.query(query, function (err, rows){
        if(err) throw err;
        else {
            if (rows.length == 0) { // 아이디가 존재하지 않는 경우
                console.log("아이디 틀림");
                res.send("아이디 틀림");
                //res.redirect("/login")
            }
            else {
                
                var password = rows[0].user_password;
                const hashPassword = crypto.createHash('sha512').update(pw).digest('hex');
                console.log(hashPassword);
                console.log(password);

                
                if(password == hashPassword) {//로그인 성공
                    console.log("로그인 성공")
                    
                    //로그인한 이메일 쿠키형식으로 web브라우저에 생성
                    // res.cookie("user", email, {
                    //     expires: new Date(Date.now() + 900000),
                    //     httpOnly: true
                    // });
                    
                
                    req.session.user_email = email;
                    res.send("로그인 성공");
                    //req.session.user_id = email;
                    //req.session.id = req.session.user_id;
                    


                    // console.log('mypagereq.session' + req.session);
                    console.log("로그인세션아이디:" + req.session.user_email);
                    // console.log("로그인세션아이디:" + req.session.user_id);
                    // req.session.save(function(){
                    //     res.redirect('/mypage');
                    // })

                }
                else { //로그인 실패 (아이디는 존재하지만 비밀번호가 다름)
                    console.log("로그인 실패 비밀번호 틀림")
                    res.send("버번틀림");
                    // res.redirect("/login");
                }
                
            }
        }
    });


});

//마이페이지 내정보
// app.get('/mypageInfo', function (req , res) {
    
//     if (req.session.user_id === undefined) {
        
//         res.render('loginAuth.ejs',{});
//     }
//     else{
//     console.log("마이페이지세션아이디 :" + req.session.user_id);

//     var query  = "select * from USER  where user_id ='" + req.session.user_id + "';" 
    
//     conn.query(query,function (err, rows,fields) {
//         if (err) {
//             console.log(err);
//         }
//         else{
//             console.log(query);
//             res.render('mypageInfo.ejs', {mypageInfo: rows});
//         }
//     });
//     }
// });
//마이페이지 내정보 + 내 리뷰, 내 댓글, 찜한곳 
app.get('/mypageInfo', function (req , res) {
    
    if (req.session.user_email === undefined) {
        
        res.render('loginAuth.ejs',{});
    }
    else{
    console.log("마이페이지세션아이디 :" + req.session.user_email);

    // var query  = "select * from USER  where user_email ='" + req.session.user_email + "';" 
    var Mypagequery  = "select * from USER  where user_email ='" + req.session.user_email + "';" 
    var Reviewquery  = "select distinct* from USER left join SHOP ON USER.user_id = SHOP.user_id where user_email ='" + req.session.user_email + "';" 
    var Commentquery  = "select * from USER  left join COMMENT ON USER.user_id = COMMENT.user_id left join SHOP ON COMMENT.user_id = SHOP.user_id and COMMENT.shop_id = SHOP.shop_id where user_email = '" + req.session.user_email + "';" 
    var Cartquery  = "select distinct* from USER left join CART ON USER.user_id = CART.user_id left join SHOP ON CART.shop_id = SHOP.shop_id  where user_email =  '" + req.session.user_email + "';" 
    conn.query(Mypagequery,function (MypageErr, myPagerows,fields) {
    conn.query(Reviewquery,function (MyReviewErr, myReviewrows,fields) {  
    conn.query(Commentquery,function (MyCommentErr, myCommentrows,fields) {  
    conn.query(Cartquery,function (MyCartErr, myCartrows,fields) { 
        if (MypageErr || MyReviewErr || MyCommentErr) {
            console.log(MypageErr);
            console.log(MyReviewErr);
            console.log(MyCommentErr);
            console.log(MyCartErr);
        }
        else{
            console.log("내정보 sql:"+ Mypagequery);
            console.log("내 리뷰 sql:"+Reviewquery);
            console.log("내 리뷰 sql:"+Commentquery);
            console.log("내 리뷰 sql:"+myCartrows);

            
            for(var i = 0; i < myPagerows.length; i++){
                //onsole.log(rows[i].user_id, rows[i].user_name, rows[i].user_nickname,rows[i].user_phonenumber,rows[i].contents,rows[i].score,rows[i].reg_dtm);
                console.log("내 정보:"+ myPagerows[i].user_id, myPagerows[i].user_email,myPagerows[i].user_name, myPagerows[i].user_nickname, myPagerows[i].user_phonenumber,myPagerows[i].user_imageaddr);
            }
            for(var i = 0; i < myReviewrows.length; i++){
                console.log("내 리뷰:"+ myReviewrows[i].shop_id,myReviewrows[i].user_id, myReviewrows[i].shop_name, myReviewrows[i].Field,myReviewrows[i].reg_dtm,myReviewrows[i].shop_addr);
            }
            for(var i = 0; i < myCommentrows.length; i++){
                console.log("내가 쓴 댓글:"+ myCommentrows[i].user_id, myCommentrows[i].comment_idx,myCommentrows[i].user_email,myCommentrows[i].shop_name,myCommentrows[i].contents, myCommentrows[i].reg_dtm,myCommentrows[i].score);
            }
            for(var i = 0; i < myCartrows.length; i++){
                console.log("내가 쓴 댓글:"+ myCartrows[i].user_id, myCartrows[i].comment_idx,myCartrows[i].user_email,myCartrows[i].shop_name,myCartrows[i].contents, myCartrows[i].reg_dtm,myCartrows[i].score);
            }
            res.render('mypageInfo.ejs', {mypageInfo: myPagerows, mypageReview: myReviewrows, mypageComment: myCommentrows, mypageCart: myCartrows});
        }
    });
    });
    });
    });
    
}

});


//마이페이지 내정보 수정(edit) 페이지
app.get('/mypageInfo/edit/:user_id', function(req,res){

    
    var query  = "select * from USER  where user_id = ?;" 
    //req.params.user_id = req.session.user_id;
    conn.query(query,req.params.user_id,function(err, rows,fields) {
        if (err) throw err;
        // console.log(req.params.shop_id);
        res.render('mypageInfoEdit.ejs',{mypageInfo: rows}); 
        console.log(req.params.user_id);
        console.log(req.user_imageaddr);
    });
});

//마이페이지 내정보 수정(update) 페이지
// app.post('/mypageInfo/update/:user_id', upload.single('image'), function(req,res){
//     //var query  = "update User SET ? where user_id ='" + req.session.user_id + "' and shop_id = "+ req.params.shop_id + " ;" 
//     var query  = "update USER SET ? where user_id ='" + req.params.user_id + "' ;" 
//     console.log(query);
//     //var query  = "update User SET ? where shop_id = "+ req.params.shop_id + " ;"  
//     conn.query(query,req.body,function(err, rows,fields) {
//         if (err) throw err;
//         console.log(rows);
//         res.redirect('/login');
//     });
// });
//마이페이지 내정보 수정(update) 페이지
//bug있음
app.post('/mypageInfo/update/:user_id', upload.single('user_imageaddr'), function(req,res){
    
    var sql = {
        user_id : req.params.user_id,
        user_email : req.body.user_email,
        user_name : req.body.user_name,
        user_nickname : req.body.user_nickname,
        user_phonenumber : req.body.user_phonenumber,
        // user_imageaddr: `/imageProfile/${req.file.filename}`
        user_imageaddr: `/public/images/${req.file.filename}`
    }
    var query  = "update USER SET ? where user_id ='" + req.params.user_id + "' ;" 
    console.log(query);
    
    //var query  = "update User SET ? where shop_id = "+ req.params.shop_id + " ;"  
    conn.query(query,sql,function(err, rows,fields) {

        if (err) throw err;
        console.log(rows);
        // res.redirect('/login');
        res.redirect('/mypageInfo');

        // console.log("req.body" + req.body);
    });
});


//마이페이지 리뷰
app.get('/mypageReview', function (req , res) {
    
    //res.render('mypage.ejs', {});
    if (req.session.user_email === undefined) {
        
        res.render('loginAuth.ejs',{});
    }
    else{
    console.log("마이페이지세션아이디 :" + req.session.user_email);

    // var query  = "select distinct* from USER left join SHOP using(user_email) where user_email ='" + req.session.user_email + "';" 
    var query  = "select distinct* from USER left join SHOP ON USER.user_id = SHOP.user_id where user_email ='" + req.session.user_email + "';" 
    
    conn.query(query,function (err, rows,fields) {
        if (err) {
            console.log(err);
        }
        else{
            console.log(query);
            for(var i = 0; i < rows.length; i++){
            //onsole.log(rows[i].user_id, rows[i].user_name, rows[i].user_nickname,rows[i].user_phonenumber,rows[i].contents,rows[i].score,rows[i].reg_dtm);
            console.log("내 정보:"+ rows[i].shop_id, rows[i].user_id, rows[i].user_name, rows[i].user_nickname,rows[i].user_phonenumber);
            console.log("내 리뷰:"+ rows[i].shop_id,rows[i].user_id, rows[i].shop_name, rows[i].Field,rows[i].reg_dtm,rows[i].shop_addr);
            }
 
            res.render('mypageReview.ejs', {mypageReview: rows});
        }
    });
    
}
});

//마이페이지 리뷰 수정(edit) 페이지
app.get('/mypageReview/edit/:shop_id', function(req,res){
    //var query  = "select distinct* from USER left join SHOP using(user_id) where user_id ='" + req.session.user_email + "';"  
    var query  = "select distinct* from USER left join SHOP ON USER.user_id = SHOP.user_id where user_email ='" + req.session.user_email + "' and shop_id = ? ;"  
    conn.query(query,req.params.shop_id,function(err, rows,fields) {
        if (err) throw err;
        // console.log(req.params.shop_id);
        res.render('mypageReviewEdit.ejs',{mypageReview: rows}); 
        console.log(req.params.shop_id);

    });
});

//마이페이지 리뷰 수정(update) 기능
//UPDATE shop set Field = '댓글수정테스트' where user_id = 'canyi@gmail.com' and shop_id = 1; 
app.post('/mypageReview/update/:shop_id', function(req,res){
    //var query  = "update User SET ? where user_id ='" + req.session.user_id + "' and shop_id = "+ req.params.shop_id + " ;" 
    //var query  = "update SHOP SET ? where user_email ='" + req.session.user_email + "' and shop_id = "+ req.params.shop_id + " ;" 
    var query  = "update SHOP left join USER on SHOP.user_id = USER.user_id SET ? where user_email ='" + req.session.user_email + "' and shop_id = "+ req.params.shop_id + " ;" 
    
    console.log(query);
    //var query  = "update User SET ? where shop_id = "+ req.params.shop_id + " ;"  
    conn.query(query,req.body,function(err, rows,fields) {
        if (err) throw err;
        console.log(rows);
        // res.redirect('/mypageReview');
        res.redirect('/mypageInfo');

    });
});


//마이페이지 댓글
app.get('/mypageComment', function (req , res) {
    
    //res.render('mypage.ejs', {});
    if (req.session.user_email == undefined) {
        
        res.render('loginAuth.ejs',{});
    }
    else{
    console.log("마이페이지세션아이디 :" + req.session.user_email);

    //var query  = "select * from USER left join COMMENT using(user_id) left join SHOP using(user_id,shop_id) where user_id ='" + req.session.user_email + "';" 
    var query  = "select * from USER  left join COMMENT ON USER.user_id = COMMENT.user_id left join SHOP ON COMMENT.user_id = SHOP.user_id and COMMENT.shop_id = SHOP.shop_id where user_email = '" + req.session.user_email + "';" 
    
    conn.query(query,function (err, rows,fields) {
        if (err) {
            console.log(err);
        }
        else{
            console.log(query);
            for(var i = 0; i < rows.length; i++){
            //onsole.log(rows[i].user_id, rows[i].user_name, rows[i].user_nickname,rows[i].user_phonenumber,rows[i].contents,rows[i].score,rows[i].reg_dtm);
            console.log("내 정보:"+ rows[i].user_id, rows[i].user_email,rows[i].user_name, rows[i].user_nickname,rows[i].user_phonenumber);
            console.log("내가 쓴 댓글:"+ rows[i].user_id, rows[i].user_email,rows[i].shop_name,rows[i].contents, rows[i].reg_dtm,rows[i].score);
            }
 
            res.render('mypageComment.ejs', {mypageComment: rows});
        }
    });
    
}
});

//마이페이지 댓글 수정(edit) 페이지
app.get('/mypageComment/edit/:comment_idx', function(req,res){ 
    //var query  = "select * from USER left join COMMENT using(user_id) left join SHOP using(user_id,shop_id) where user_id ='" + req.session.user_id + "' and comment_idx = ?;" 
    var query  = "select * from USER  left join COMMENT ON USER.user_id = COMMENT.user_id left join SHOP ON COMMENT.user_id = SHOP.user_id and COMMENT.shop_id = SHOP.shop_id where user_email ='" + req.session.user_email + "' and comment_idx = ?;" 
    
    conn.query(query,req.params.comment_idx,function(err, rows,fields) {
        if (err) throw err;
        // console.log(req.comment_idx);
        res.render('mypageCommentEdit.ejs',{mypageComment: rows}); 
        console.log(req.params.comment_idx);

    });
});

//마이페이지 댓글 수정(update) 기능
app.post('/mypageComment/update/:comment_idx', function(req,res){
    //var query  = "update User SET ? where user_id ='" + req.session.user_id + "' and shop_id = "+ req.params.shop_id + " ;" 
    var query  = "update COMMENT inner join SHOP ON (COMMENT.shop_id = SHOP.shop_id and COMMENT.user_id = SHOP.user_id) inner join USER ON (SHOP.user_id = USER.user_id)  SET ?  WHERE user_email ='" + req.session.user_email + "' and comment_idx = "+ req.params.comment_idx + " ;" 
    console.log(query);
    //var query  = "update User SET ? where shop_id = "+ req.params.shop_id + " ;"  
    conn.query(query,req.body,function(err, rows,fields) {
        if (err) throw err;
        console.log(rows);
        // res.redirect('/mypageComment');
        res.redirect('/mypageInfo');

    });
});

//마이페이지 댓글 삭제(delete) 기능
app.get('/mypageComment/delete/:comment_idx', function(req,res){ 
    //var query  = "delete from COMMENT where user_id ='" + req.session.user_id + "' and comment_idx = ?;" 
    var query  = "delete from COMMENT where comment_idx = ?;" 
    conn.query(query,req.params.comment_idx,function(err, rows,fields) {
        if (err) throw err;
        // console.log(req.comment_idx);
        // res.redirect('/mypageComment');
        res.redirect('/mypageInfo');

        console.log("삭제한 댯글아이디"+ req.params.comment_idx);

    });
});

//마이페이지 찜하기
app.get('/mypageCart', function (req , res) {
    
    //res.render('mypage.ejs', {});
    if (req.session.user_email == undefined) {
        
        res.render('loginAuth.ejs',{});
    }
    else{
    console.log("마이페이지세션아이디 :" + req.session.user_email);

    var query  = "select distinct* from USER left join CART ON USER.user_id = CART.user_id left join SHOP ON CART.shop_id = SHOP.shop_id  where user_email =  '" + req.session.user_email + "';" 
    
    conn.query(query,function (err, rows,fields) {
        if (err) {
            console.log(err);
        }
        else{
            console.log(query);
            for(var i = 0; i < rows.length; i++){
            //onsole.log(rows[i].user_id, rows[i].user_name, rows[i].user_nickname,rows[i].user_phonenumber,rows[i].contents,rows[i].score,rows[i].reg_dtm);
            console.log("내 정보:"+ rows[i].user_id,rows[i].user_email, rows[i].user_name, rows[i].user_nickname,rows[i].user_phonenumber);
            console.log("내가 찜한곳:"+ rows[i].user_id, rows[i].user_email,rows[i].Field, rows[i].contents, rows[i].reg_dtm);
            }
 
            res.render('mypageCart.ejs', {mypageCart: rows});
        }
    });
    
}
});

// app.get('/mypage', isLogin,function (req , res) {
    
//     res.render('mypage.ejs',{사용자: req.user});

// });

//login 할경우 mypage보이기 설정
// function isLogin(req, res, next ) {
//     if(req.user){
//         next();
//     }
//     else{
//         res.send('로그인 해주세요');
//     }
// }


app.listen(8000, function() {
    
    console.log('listening on 8000');

});


//메인페이지
app.get('/', function (req , res) {
          
        res.render('login.ejs', {});

})


//세션 로그인횟수 카운트
app.get('/count', function(req, res) {

    console.log(req.session);
    if (!req.session.num) {
      req.session.num = 1;
    } else {
      req.session.num += 1;
    }
    res.send(`Views : ${req.session.num}`);
});

app.get('/temp', function(req, res) {
    
    // res.send('result' + req.session.count);
    res.send('result' + req.session.user_email);
})

//로그아웃 세션 연결 강제로 끊기
app.get('/logout',function(req, res) {
    

    // req.session.destroy(function () {
    //     req.session;
    //     // console.log(req.session.id);
    // });
    // res.send('세션 삭제완료')
    // console.log(req.session.id);
    // if(req.session.id){
    //      delete req.session.id;
    //     // req.session.destroy(String(req.session.id));
    //     // req.session.id = null;
    //     console.log("로그아웃: " + req.session.id);
    //     res.send('세션 삭제완료');
    // }

    console.log('삭제할 세션아이디:' + req.session.user_email);
    delete req.session.user_email;
    res.send('로그아웃 완료');
    console.log('삭제완료한 세션아이디:' + req.session.user_email);
    

})










