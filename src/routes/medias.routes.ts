import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const mediasRouter = Router()

// mediasRouter.post('/upload-image', wrapAsync(uploadSingleImageController))
mediasRouter.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrapAsync(uploadImageController))

export default mediasRouter
