import { Router } from 'express'
import { memoryController } from '../controllers/memory.controller'
import { placeController } from '../controllers/place.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const placeRoutes = Router()

placeRoutes.use(authMiddleware)

placeRoutes.get('/search', placeController.search)
placeRoutes.post('/', placeController.save)
placeRoutes.get('/:placeId/memories/me', memoryController.myForPlace)
placeRoutes.get('/:placeId/memories/public', memoryController.publicForPlace)
placeRoutes.get('/:placeId', placeController.detail)
