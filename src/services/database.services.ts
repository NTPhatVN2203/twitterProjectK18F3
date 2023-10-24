import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
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
}

const databaseService = new DatabaseService() //tạo ra 1 object databaseService
// thằng này đã link vs mongoDB và có method lấy collection users,...
export default databaseService
