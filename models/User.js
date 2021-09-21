const mongoose = require('mongoose')
const bcrypt = require('bcrypt')	//bcrypt사용을 위해 선언
const saltRounds = 10	//salt를 이용해서 암호화 할 것임(saltRounds는 salt가 몇 글자인지 나타냄)
const jwt = require('jsonwebtoken')	//token생성을 위해 선언

const userSchema = mongoose.Schema({	//스키마 만드는 작업
	name: {
		type: String,
		maxlength: 50,
	},
	email: {
		type: String,
		trim: true,
		unique: 1
	},
	password: {
		type: String,
		minlength: 4
	},
	lastname: {
		type: String,
		maxlength: 50
	},
	role: {
		type: Number,
		default: 0
	},
	image: String,
	token: {
		type: String
	},
	tokenExp: {
		type: Number
	}
})

userSchema.pre('save', function(next) { 	//mongose에서 가져온 메소드로 user정보를 저장하기 전에 function을 행한다는 의미
	var user = this;	//위의 userSchema에 있는 모든 것을 가져옴(name, email, password, ...)
	
	if(user.isModified('password')){	//비밀번호를 변경할 때만 동작(없으면 이메일 등 다른 것만 바꿀 때도 동작함)
		//비밀번호 암호화
		bcrypt.genSalt(saltRounds, function(err, salt) {
			if(err)	return next(err)	//에러 발생시 바로 err와 함께 바로 넘겨줌

			bcrypt.hash(user.password, salt, function(err, hash) {	//암호화 작업 (첫번째 인자 : password)
				if(err) return next(err)	//암호화 비밀번호 실패
				user.password = hash	//암호화 된 비밀번호로 변경
				next()	//전부 끝나면 index.js에 정보 저장위치로 이동
			})	
		})
	} else {
		next()
	}
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
	//clinet가 입력한 password와 DB에서 가지고 있는 hash된 password가 맞는지 비교
	bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
		if(err) return cb(err)	//비밀번호가 일치하지 않다
		
		cb(null, isMatch)
	})
}

userSchema.methods.generateToken = function(cb) {
	//jsonwebtoken을 이용해서 token을 생성하기
	var user = this;

	var token = jwt.sign(user._id.toHexString(), 'anythingIsOK')
	//user._id + 'anythingIsOK' = token
	//'anythingIsOK' -> user._id
	user.token = token
	user.save(function(err, user) {
		if(err) return cb(err)	//에러 발생 시 에러 전달

		cb(null, user)	//save가 잘 된다면 user정보만 전달
	})
}

const User = mongoose.model('User', userSchema)	//스키마를 모델로 감싸줌

module.exports = { User } //이 모델을 다른 파일에서도 쓸 수 있게 하기 위해 exports로 선언