const { User } = require('../models/User');	//User 모델을 가져옴(user을 찾기 위해)

let auth = (req, res, next) => {	//index.js의 auth부분 구현 (인증 부분)
	//인증 처리를 하는 곳

	//client cookie에서 token을 가져옴 (cookie parser을 이용)
	let token = req.cookies.x_auth;

	//token을 복호화 후 해당 user을 찾음
	User.findByToken(token, (err, user) => {
		if(err) throw err;
		if(!user) return res.json({ isAuth: false, error: true })	//해당 user가 없으면, 인증 false + 에러 true
		
		//있으면
		req.token = token;	//req에다가 넣어주면 index.js의 app.get auth부분에서 그대로 사용할 수 있음
		req.user = user;
		next();	//index.js의 app.get auth부분의 중간 auth에서 실행하다가 왔는데 그 부분으로 실행을 다시 넘겨주기 위함(없으면 middleware에서 갖혀있음)
	})

	//user가 있으면 인증 완료

	//user가 없으면 인증 불가
}

module.exports = { auth };	//auth를 외부 파일에서도 사용할 수 있도록 함