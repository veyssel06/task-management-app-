const express = require('express')
const router = express.Router()
const Task = require('../models/Task')

// Tüm görevleri getir
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

// Yeni görev ekle
router.post('/', async (req, res) => {
  try {
    const { title, description, priority } = req.body
    const task = new Task({
      title,
      description,
      priority,
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
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
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

module.exports = router