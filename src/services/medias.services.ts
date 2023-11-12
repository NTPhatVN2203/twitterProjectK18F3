import sharp from 'sharp'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { Request } from 'express'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req) //handleUploadImage giờ trả ra mảng các file

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        //files.map return về mảng các promise
        //xử lý từng file một, mà có Promisea.all sẽ xử lý song song=> nhanh hơn
        //xử lý file bằng sharp
        ////filepath là đường của file cần xử lý đang nằm trong uploads/temp
        //file.newFilename: là tên unique mới của file sau khi upload lên, ta xóa đuôi và thêm jpg
        const newFilename = getNameFromFullname(file.newFilename) + '.jpg'
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename //đường dẫn mới của file sau khi xử lý
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath) //xóa file cũ đi
        //cữ mỗi file sẽ biến thành object chứa thông tin của file
        //để ý url, vì ta đã thêm /image/ để đúng với route đã viết ở Serving static file
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/image/${newFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    //lưu video vào trong uploads/video
    //hàm nhận vào req và biến req thành các file
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const { newFilename } = file
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
