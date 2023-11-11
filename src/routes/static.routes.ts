import { Router } from 'express'
import { defaultTo } from 'lodash'
import { serveImageController } from '~/controllers/medias.controllers'

const staticRouter = Router()

staticRouter.get('/image/:namefile', serveImageController)

export default staticRouter
