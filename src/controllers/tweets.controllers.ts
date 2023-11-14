import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TWEETS_MESSAGES } from '~/models/message'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayLoad } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  //muốn đăng bài thì cần
  const { user_id } = req.decoded_authorization as TokenPayLoad //để biết người đăng
  const body = req.body as TweetRequestBody //nội dung của tweet
  const result = await tweetsService.createTweet({ user_id, body }) //createTweet chưa code
  res.json({
    message: TWEETS_MESSAGES.TWEET_CREATED_SUCCESSFULLY, // thêm TWEET_CREATED_SUCCESSFULLY: 'Tweet created success'
    result
  })
}
