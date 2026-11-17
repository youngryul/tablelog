import { Router } from 'express'
import { memoryController } from '../controllers/memory.controller'
import { placeController } from '../controllers/place.controller'
import { profileController } from '../controllers/profile.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const meRoutes = Router()

meRoutes.use(authMiddleware)

meRoutes.get('/profile', profileController.me)
meRoutes.put('/profile', profileController.updateMe)
meRoutes.get('/places/map', placeController.myPlacesInBounds)
meRoutes.get('/places', placeController.myPlaces)
meRoutes.get('/memories', memoryController.myTimeline)
