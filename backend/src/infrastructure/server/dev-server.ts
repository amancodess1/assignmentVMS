import express from 'express'
import { json } from 'body-parser'
import routesRouter from '../../adapters/inbound/http/routes'

const app = express()
app.use(json())
app.use('/api/routes', routesRouter)

app.get('/api/health', (req,res)=> res.json({ok:true}))

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log(`Dev server listening ${port}`))
