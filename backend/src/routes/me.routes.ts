import { Router } from 'express'
import { memoryController } from '../controllers/memory.controller'
import { placeController } from '../controllers/place.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const meRoutes = Router()

meRoutes.use(authMiddleware)

meRoutes.get('/places/map', placeController.myPlacesInBounds)
meRoutes.get('/places', placeController.myPlaces)
meRoutes.get('/memories', memoryController.myTimeline)
