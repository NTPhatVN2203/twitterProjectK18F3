import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import { MongoClient } from 'mongodb'
config()

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 4000
initFolder()
databaseService.connect().then(() => {
  databaseService.indexUsers()
})

app.get('/', (req, res) => {
  res.send('hello world')
})

app.use('/users', usersRouter)
//localhost:3000/users/tweets
app.use('/medias', mediasRouter)

// app.use(express.static(UPLOAD_DIR)) //static file handler
//nếu viết như vậy thì link dẫn sẽ là localhost:4000/blablabla.jpg
// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR)) //nếu muốn thêm tiền tố, ta sẽ làm thế này
//vậy thì nghĩa là vào localhost:4000/static/blablabla.jpg

app.use('/static', staticRouter)

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`server dang chay tren PORT ${PORT}`)
})
