// 1. Gerekli kütüphaneleri dahil et
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

router.post('/register', async (req, res) => {
  try {
    // 1. Kullanıcıdan gelen bilgileri al
    const { name, email, password } = req.body

    // 2. Email kayıtlı mı kontrol et
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı' })
    }

    // 3. Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Kullanıcıyı kaydet
    const user = new User({ name, email, password: hashedPassword })
    await user.save()

    // 5. Başarılı mesajı gönder
    res.status(201).json({ message: 'Kayıt başarılı!' })

  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    // 1. Kullanıcıdan gelen bilgileri al
    const { email, password } = req.body

    // 2. Email veritabanında var mı kontrol et
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Email veya şifre hatalı' })
    }

    // 3. Şifre doğru mu kontrol et
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Email veya şifre hatalı' })
    }

    // 4. JWT token üret
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 5. Token'ı gönder
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })

  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message })
  }
})

// 4. Dışa aktar
module.exports = router