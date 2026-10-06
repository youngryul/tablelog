import { Router } from 'express'
import multer from 'multer'
import { memoryController } from '../controllers/memory.controller'
import { authMiddleware } from '../middlewares/auth.middleware'
import { storageService } from '../services/storage.service'

export const memoryRoutes = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: storageService.maxFileSizeBytes, files: 10 },
})

memoryRoutes.use(authMiddleware)

memoryRoutes.post('/', memoryController.create)
memoryRoutes.put('/:memoryId', memoryController.update)
memoryRoutes.delete('/:memoryId', memoryController.remove)
memoryRoutes.post('/:memoryId/images', upload.array('images', 10), memoryController.uploadImages)
