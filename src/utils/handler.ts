import { NextFunction, RequestHandler, Request, Response } from 'express'

export const wrapAsync = <P>(func: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      //một hàm 1 async là 1 promise (là bất đồng bộ) ==> chúng ta phải await
      //dùng await tại đây là bởi vì, khi bạn cho 1 hàm vào đây (func) nó là 1
      // hàm 1 async nên nó sẽ trả về 1 promise => promise khi dùng thì phải đợi
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
