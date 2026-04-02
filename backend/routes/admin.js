const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Task = require('../models/Task')

const ADMIN_EMAIL = 'admin@taskmanager.com'   // ← istediğin email
const ADMIN_PASSWORD = 'admin123'              // ← istediğin şifre

// Admin login
router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-secret-token-2024' })
  } else {
    res.status(401).json({ message: 'Gecersiz admin bilgileri!' })
  }
})

// Admin token dogrulama middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Yetkisiz erisim!' })
  
  const token = authHeader.split(' ')[1]
  if (token !== 'admin-secret-token-2024') {
    return res.status(401).json({ message: 'Yetkisiz erisim!' })
  }
  next()
}

// Genel istatistikler
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalTasks = await Task.countDocuments()
    const activeTasks = await Task.countDocuments({ status: { $ne: 'archived' } })
    const archivedTasks = await Task.countDocuments({ status: 'archived' })
    res.json({ totalUsers, totalTasks, activeTasks, archivedTasks })
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatasi', error: err.message })
  }
})

// Tum kullanicilar + gorev istatistikleri
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const tasks = await Task.find({ user: user._id })
      return {
        ...user.toObject(),
        stats: {
          total: tasks.length,
          todo: tasks.filter(t => t.status === 'todo').length,
          inProgress: tasks.filter(t => t.status === 'inProgress').length,
          done: tasks.filter(t => t.status === 'done').length,
          archived: tasks.filter(t => t.status === 'archived').length,
        }
      }
    }))
    res.json(usersWithStats)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatasi', error: err.message })
  }
})

// Kullanici sil
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await Task.deleteMany({ user: req.params.id })
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Kullanici silindi' })
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatasi', error: err.message })
  }
})

module.exports = { router, adminAuth }