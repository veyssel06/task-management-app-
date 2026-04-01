const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cron = require('node-cron')  // ← YENİ
require('dotenv').config()

const authMiddleware = require('./middleware/auth')
const Task = require('./models/Task')  // ← YENİ

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

// ───────────────────────────────────────────
// 🕛 Gece yarısı otomatik arşivleme
// ───────────────────────────────────────────
cron.schedule('0 0 * * *', async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const result = await Task.updateMany(
      {
        status: 'done',
        completedAt: { $lte: oneDayAgo }
      },
      {
        $set: { status: 'archived' }
      }
    )

    console.log(`[CRON] ${new Date().toLocaleString('tr-TR')} → ${result.modifiedCount} task arşivlendi.`)
  } catch (err) {
    console.error('[CRON] Arşivleme hatası:', err)
  }
}, {
  timezone: 'Europe/Istanbul'  // Türkiye saatine göre
})

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.log('Bağlantı hatası:', err))

app.listen(process.env.PORT, () => {
  console.log(`Sunucu ${process.env.PORT} portunda çalışıyor`)
})