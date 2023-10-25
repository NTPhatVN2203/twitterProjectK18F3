import { NextFunction, RequestHandler, Request, Response } from 'express'

export const wrapAsync = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      //một hàm 1 async là 1 promise ==> chúng ta phải await
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
