const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')	//bodyParser가져옴
const { User } = require("./models/User");	//User.js의 모델을 가져옴
const config = require('./config/key');	//key.js에 있는 정보를 mongoose.connect 부분에 가져오기 위해 사용

app.use(bodyParser.urlencoded({extended: true}));	//applicatiopn/x-www-form-urlencoded 이렇게 된 데이터를 분석해서 가져올 수 있게 함
app.use(bodyParser.json());	//application/json 이렇게 된 부분을 분석해서 가져올 수 있게 함\

app.get('/', (req, res) => {
  res.send('Hello World!44')
})

app.post('/register', (req, res) => {
	//회원 가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 DB에 넣는 기능.


	const user = new User(req.body)	//인스턴스 생성
									//bodyParser을 이용해 client에게 정보를 받아 옴

	user.save((err, userInfo) => {		//mogoDB에서 오는 메소드
		if(err)	return res.json({ success: false, err})		//저장을 할 때 에러가 있다면 json형식으로 전달, 에러 메시지도 함께 전달
		return res.status(200).json({ success: true })		//성공했을 경우, 성공 전달
	})

})

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
	//useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
	//몽구스 버전이 6.0이상이라면 항상 이 문장을 기억하고 실행하기 때문에 더이상 지원하지 않는다. 주석처리 안하면 에러
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})