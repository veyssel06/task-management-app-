const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cron = require('node-cron')
require('dotenv').config()

const authMiddleware = require('./middleware/auth')
const Task = require('./models/Task')

const app = express()

// ✅ CORS düzeltmesi - spesifik origin ve header tanımı
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))



app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/tasks', authMiddleware, require('./routes/tasks'))
app.use('/api/user', authMiddleware, require('./routes/user'))

// ✅ Admin route - middleware ile koru
const { router: adminRouter } = require('./routes/admin')
app.use('/api/admin', adminRouter) // admin/login açık kalmalı, diğerleri admin.js içinde korunmalı

app.get('/', (req, res) => {
  res.json({ message: 'API çalışıyor!' })
})

// Gece yarısı otomatik arşivleme
cron.schedule('0 0 * * *', async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const result = await Task.updateMany(
      { status: 'done', completedAt: { $lte: oneDayAgo } },
      { $set: { status: 'archived' } }
    )
    console.log(`[CRON] ${new Date().toLocaleString('tr-TR')} → ${result.modifiedCount} task arşivlendi.`)
  } catch (err) {
    console.error('[CRON] Arşivleme hatası:', err)
  }
}, { timezone: 'Europe/Istanbul' })

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.log('Bağlantı hatası:', err))

// ✅ PORT .env'den okunuyor, yoksa 5000 default
const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`)
})