const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')	//bodyParser가져옴
const { auth } = require('./middleware/auth');	//auth.js의 모델을 가져옴
const { User } = require("./models/User");	//User.js의 모델을 가져옴
const config = require('./config/key');	//key.js에 있는 정보를 mongoose.connect 부분에 가져오기 위해 사용
const cookieParser = require('cookie-parser');	//cookie-parser사용을 위해 선언

app.use(bodyParser.urlencoded({extended: true}));	//applicatiopn/x-www-form-urlencoded 이렇게 된 데이터를 분석해서 가져올 수 있게 함
app.use(bodyParser.json());	//application/json 이렇게 된 부분을 분석해서 가져올 수 있게 함
app.use(cookieParser());	//cookieParser사용할 수 있게 함

app.get('/', (req, res) => {
  res.send('Hello test World!44')
})

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
	//useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
	//몽구스 버전이 6.0이상이라면 항상 이 문장을 기억하고 실행하기 때문에 더이상 지원하지 않는다. 주석처리 안하면 에러
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.post('/api/users/register', (req, res) => {
	//회원 가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 DB에 넣는 기능.

	//모든 정보를 받아옴
	const user = new User(req.body)	//인스턴스 생성
									//bodyParser을 이용해 client에게 정보를 받아 옴

	//저장 전 bcrypt를 이용하여 암호화
	//User.js의 userSchema.pre부분
	
	//받아온 정보 저장
	user.save((err, userInfo) => {		//mogoDB에서 오는 메소드
		if(err)	return res.json({ success: false, err})		//저장을 할 때 에러가 있다면 json형식으로 전달, 에러 메시지도 함께 전달
		return res.status(200).json({ success: true })		//성공했을 경우, 성공 전달
	})

})

app.post('/api/users/login', (req, res) => {	//로그인 기능 구현
	//요청된 이메일 DB에서 찾음
	User.findOne({ email: req.body.email }, (err, user) => {	//mongoDB에서 제공하는 메서드
		if(!user){	//요청된 이메일을 가진 유저가 없다면
			return res.json({
				loginSuccess: false,
				message: "요청한 이메일을 가진 유저가 없습니다."
			})
		}

		//요청된 이메일이 DB에 있다면, 비밀번호 일치 여부 확인(아래 함수는 User.js에 명시)
		user.comparePassword(req.body.password, (err, isMatch) => {	//call-back function을 이용하여 맞는지 확인하고 이후 동작 명시
			if(!isMatch)	//비밀번호가 일치하지 않을 때
				return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})

		
			//비밀번호가 맞다면 토큰 생성(jsonwebtoken 라이브러리 이용)
			user.generateToken((err, user) => {
				if(err) return res.status(400).send(err);	//400이면 에러

				//user에 토큰이 있음. 토큰을 쿠키, 로컬저장소 등에 저장(여기에서는 쿠키에다가 저장) : cookie-parser을 이용
				res.cookie("x_auth", user.token)
				.status(200)
				.json({ loginSuccess: true, userId: user._id })
			})
		})
	})	

})

app.get('/api/users/auth', auth, (req, res) => {
	//이 부분이 실행된다는건 middleware(auth)을 통과 했다는 말이고 그 말은 Authentication이 True라는 말이다.
	res.status(200).json({
		//client에 전달하는 내용
		_id: req.user._id,
		isAdmin: req.user.role === 0 ? false : true,	//role === 0 : 일반유저, role >= 1 : 관리자
		isAuth: true,
		email: req.user.email,
		name: req.user.name,
		lastname: req.user.lastname,
		role: req.user.role,
		image: req.user.image		
	})
})

app.get('/api/users/logout', auth, (req, res) => {	//request, response 순서 바뀌면 안됨
													//로그아웃도 마찬가지로 middleware(auth)부분을 거쳐야함 (auth부분을 거쳐 user정보와 토큰을 가져옴)
	User.findOneAndUpdate({ _id: req.user._id },	//함수 재정의, auth에서 가져온 user의 _id를 이용함
		{ token: "" },	//token 초기화
		(err, user) => {
			if(err) return res.json({ success: false, err });
			return res.status(200).send({	//에러 발생하지 않았을 때
				success: true
			})
		}	
	)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})