import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { Follower } from '~/models/schemas/Followers.schema'
import Tweet from '~/models/schemas/Tweet.schema'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@tweetprojectk18f3.kjqivvl.mongodb.net/?retryWrites=true&w=majority`

//đây là 1 database lớn của mình (server)
//trong đây chứa các collection khác nhau: users,...
//chứa các thao tác giúp link với thằng data (mongoDB)
// với thao tác lấy collection(users,...)
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Lỗi trong quá trình kết nối mongo', error)
      throw error
    }
  }
  // accessor: prop
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
    //ép máy tỉnh hiểu DB_USERS_COLLECTION là string
  }

  async indexUsers() {
    const isExisted = await this.users.indexExists(['username_1', 'email_1', 'email_1_password_1'])
    if (isExisted) return
    await this.users.createIndex({ email: 1 }, { unique: true }) //register
    await this.users.createIndex({ username: 1 }, { unique: true }) //getProfile
    await this.users.createIndex({ email: 1, password: 1 }) //login
  }

  //hàm tạo và lấy collection
  //method này trả về 1 collection chứa các object RefreshToken
  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  async indexRefreshToken() {
    const isExisted = await this.refreshToken.indexExists(['token_1', 'exp_1'])
    if (isExisted) return
    await this.refreshToken.createIndex({ token: 1 })
    await this.refreshToken.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
  async indexFollowers() {
    const isExisted = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (isExisted) return
    await this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService() //tạo ra 1 object databaseService
// thằng này đã link vs mongoDB và có method lấy collection users,...
export default databaseService
