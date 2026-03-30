const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Task = require('../models/Task')

// Profil bilgilerini getir
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    const tasks = await Task.find({ user: req.userId })

    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'inProgress').length,
      done: tasks.filter(t => t.status === 'done').length,
    }

    res.json({ user, stats })
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

// Profil güncelle
router.put('/profile', async (req, res) => {
  try {
    const { name, avatar } = req.body
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, avatar },
      { new: true }
    ).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

// Şifre değiştir
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.userId)

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre hatalı!' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ message: 'Şifre başarıyla değiştirildi!' })
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

module.exports = router