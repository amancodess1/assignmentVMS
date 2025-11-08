import express from 'express'
import { json } from 'body-parser'
import routesRouter from '../../adapters/inbound/http/routes'
import bankingRouter from '../../adapters/inbound/http/banking'
import complianceRouter from '../../adapters/inbound/http/compliance'
import poolsRouter from '../../adapters/inbound/http/pools'

const app = express()

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.use(json())

// Register all routers
app.use('/api/routes', routesRouter)
app.use('/api/banking', bankingRouter)
app.use('/api/compliance', complianceRouter)
app.use('/api/pools', poolsRouter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Error handling middleware (must be after routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

const port = process.env.PORT || 4000

// Only start listening if not in test environment
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  app.listen(port, () => {
    console.log(`✅ Dev server listening on port ${port}`)
    console.log(`   Health check: http://localhost:${port}/api/health`)
  })
}

export default app