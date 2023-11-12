import { Router } from 'express'
import { defaultTo } from 'lodash'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controllers'

const staticRouter = Router()

staticRouter.get('/image/:namefile', serveImageController)
staticRouter.get('/video-stream/:namefile', serveVideoStreamController)

export default staticRouter
