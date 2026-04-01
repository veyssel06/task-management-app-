// Tarayıcı bildirimi izni iste
export const requestPermission = async () => {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// Tarayıcı bildirimi gönder
export const sendBrowserNotification = (title, body) => {
  if (Notification.permission !== 'granted') return
  new Notification(title, {
    body,
    icon: '/favicon.ico',
  })
}

// Günlük özet — bugün zaten gösterildi mi kontrol et
export const shouldShowDailySummary = () => {
  const last = localStorage.getItem('lastNotificationDate')
  const today = new Date().toDateString()
  return last !== today
}

export const markDailySummaryShown = () => {
  localStorage.setItem('lastNotificationDate', new Date().toDateString())
}