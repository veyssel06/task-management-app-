const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authMiddleware = require('./middleware/auth')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/tasks', authMiddleware, require('./routes/tasks'))
app.use('/api/user', authMiddleware, require('./routes/user'))

// Ana sayfa
app.get('/', (req, res) => {
  res.json({ message: 'API çalışıyor!' })
})

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.log('Bağlantı hatası:', err))

app.listen(process.env.PORT, () => {
  console.log(`Sunucu ${process.env.PORT} portunda çalışıyor`)
})