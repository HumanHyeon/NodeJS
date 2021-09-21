const mongoose = require('mongoose')

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

const User = mongoose.model('User', userSchema)	//스키마를 모델로 감싸줌

module.exports = { User } //이 모델을 다른 파일에서도 쓸 수 있게 하기 위해 exports로 선언