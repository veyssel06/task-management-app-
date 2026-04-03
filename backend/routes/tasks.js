const express = require('express')
const router = express.Router()
const cron = require('node-cron')
const Task = require('../models/Task')
 
// ─────────────────────────────────────────────
//  CRON — Her gece 00:00 (İstanbul) çalışır
//  status: 'done' olan görevleri arşivler
// ─────────────────────────────────────────────
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date()
 
    // Bugünün başlangıcı (00:00:00)
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
 
    const result = await Task.updateMany(
      {
        status: 'done',
        // Bugün tamamlananları beklet, önceki günleri arşivle
        completedAt: { $lt: startOfToday },
      },
      {
        $set: {
          status:     'archived',
          archivedAt: now,
        },
      }
    )
 
    console.log(`[Cron] ${now.toISOString()} → ${result.modifiedCount} görev arşivlendi.`)
  } catch (err) {
    console.error('[Cron] Arşivleme hatası:', err.message)
  }
}, {
  timezone: 'Europe/Istanbul',
})
 
console.log('[Cron] Gece yarısı arşivleme zamanlanıcısı aktif.')
 
// ─────────────────────────────────────────────
//  GET /api/tasks
//  Aktif görevleri getir (done + todo + doing)
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({
      user:   req.userId,
      status: { $ne: 'archived' },
    }).sort({ createdAt: -1 })
 
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})
 
// ─────────────────────────────────────────────
//  GET /api/tasks/history
//  Arşivlenmiş görevleri tam detayıyla getir
// ─────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const tasks = await Task.find({
      user:   req.userId,
      status: 'archived',
    })
    .select('title description priority status createdAt completedAt archivedAt dueDate')
    .sort({ archivedAt: -1 })
    .lean()
 
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})
 
// ─────────────────────────────────────────────
//  POST /api/tasks
//  Yeni görev ekle
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body
 
    const task = new Task({
      title,
      description,
      priority,
      status:    status || 'todo',
      dueDate:   dueDate || null,
      user:      req.userId,
      createdAt: new Date(),
    })
 
    await task.save()
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})
 
// ─────────────────────────────────────────────
//  PUT /api/tasks/:id
//  Görevi güncelle
//  → status 'done'a geçince completedAt set edilir
//  → status geri alınırsa completedAt temizlenir
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body }
 
    if (req.body.status === 'done') {
      // Tamamlandı — saati kaydet
      updateData.completedAt = new Date()
    } else if (req.body.status === 'todo' || req.body.status === 'doing') {
      // Geri alındı — completedAt temizle
      updateData.completedAt = null
    }
 
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updateData,
      { new: true }
    )
 
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı' })
 
    res.json(task)
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})
 
// ─────────────────────────────────────────────
//  DELETE /api/tasks/:id
//  Görevi kalıcı sil
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı' })
 
    res.json({ message: 'Görev silindi' })
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})
 
// ─────────────────────────────────────────────
//  POST /api/tasks/archive-done  (manuel tetikleme)
//  Admin paneli veya test için — cron'u beklemeden arşivler
// ─────────────────────────────────────────────
router.post('/archive-done', async (req, res) => {
  try {
    const now = new Date()
 
    const result = await Task.updateMany(
      { user: req.userId, status: 'done' },
      {
        $set: {
          status:     'archived',
          archivedAt: now,
        },
      }
    )
 
    res.json({
      message: `${result.modifiedCount} görev arşivlendi.`,
      archivedAt: now,
    })
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})
 
module.exports = router
 