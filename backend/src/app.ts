import cors from 'cors'
import express from 'express'
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware'
import { meRoutes } from './routes/me.routes'
import { memoryRoutes } from './routes/memory.routes'
import { placeRoutes } from './routes/place.routes'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

app.use('/api/places', placeRoutes)
app.use('/api/me', meRoutes)
app.use('/api/memories', memoryRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)
