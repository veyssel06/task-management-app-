const express = require('express')
const router = express.Router()
const Task = require('../models/Task')

// Tüm aktif görevleri getir (archived hariç)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ 
      user: req.userId,
      status: { $ne: 'archived' }
    })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

// Geçmiş görevleri getir (archived)
router.get('/history', async (req, res) => {
  try {
    const tasks = await Task.find({ 
      user: req.userId,
      status: 'archived'
    }).sort({ completedAt: -1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

// Yeni görev ekle
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, status } = req.body
    const task = new Task({
      title,
      description,
      priority,
      status,
      user: req.userId
    })
    await task.save()
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

// Görevi güncelle
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (req.body.status === 'done') {
      updateData.completedAt = new Date()
    }
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    res.json(task)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

// Görevi sil
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id)
    res.json({ message: 'Görev silindi' })
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

// Gece yarısı arşivleme (gece yarısı çağrılır)
router.post('/archive-done', async (req, res) => {
  try {
    await Task.updateMany(
      { user: req.userId, status: 'done' },
      { status: 'archived' }
    )
    res.json({ message: 'Tamamlanan görevler arşivlendi!' })
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

module.exports = router