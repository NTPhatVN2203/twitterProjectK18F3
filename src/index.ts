import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
const app = express()
app.use(express.json())
const PORT = 3000
databaseService.connect()

app.get('/', (req, res) => {
  res.send('hello world')
})

app.use('/users', usersRouter)
//localhost:3000/users/tweets

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`server dang chay tren PORT ${PORT}`)
})
