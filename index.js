const express = require('express')
const app = express()
const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://sh:tpgus@nodejs.bbriz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
	//useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false //몽구스 버전이 6.0이상이라면 항상 이 문장을 기억하고 실행하기 때문에 더이상 지원하지 않는다. 주석처리 안하면 에러
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})