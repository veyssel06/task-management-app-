const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

// Middleware
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.log('Bağlantı hatası:', err))

app.listen(process.env.PORT, () => {
  console.log(`Sunucu ${process.env.PORT} portunda çalışıyor`)
})