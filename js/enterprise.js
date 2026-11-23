const intro = document.getElementById('enterprise-intro')
const key = 'offline-playroom:enterprise-intro:v1'
let seen = false
try { seen = localStorage.getItem(key) === 'seen' } catch { /* Private browsing may restrict storage. */ }
if (!seen && intro) {
  intro.addEventListener('close', () => {
    try { localStorage.setItem(key, 'seen') } catch { /* The notice may then appear on the next visit. */ }
  }, { once: true })
  intro.showModal()
}
