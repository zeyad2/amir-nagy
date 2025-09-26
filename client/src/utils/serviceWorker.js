// Service Worker Registration for SAT Admin PWA

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
)

// Register service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(import.meta.env.BASE_URL || '/', window.location.href)
    if (publicUrl.origin !== window.location.origin) {
      return
    }

    window.addEventListener('load', () => {
      const swUrl = '/sw.js'

      if (isLocalhost) {
        // Running on localhost
        checkValidServiceWorker(swUrl)

        // Add logging for development
        navigator.serviceWorker.ready.then(() => {
          console.log('[PWA] Service worker is ready in development mode')
        })
      } else {
        // Running on production
        registerValidSW(swUrl)
      }
    })
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      console.log('[PWA] Service worker registered successfully')

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing
        if (installingWorker == null) {
          return
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available, show update prompt
              showUpdateAvailable()
            } else {
              // Content cached for offline use
              console.log('[PWA] Content cached for offline use')
              showOfflineReady()
            }
          }
        })
      })

      // Subscribe to push notifications for admin
      subscribeToPushNotifications(registration)
    })
    .catch(error => {
      console.error('[PWA] Service worker registration failed:', error)
    })
}

function checkValidServiceWorker(swUrl) {
  // Check if service worker can be found
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      if (
        response.status === 404 ||
        (response.headers.get('content-type') != null &&
          response.headers.get('content-type').indexOf('javascript') === -1)
      ) {
        // No service worker found, reload page
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        // Service worker found, proceed normally
        registerValidSW(swUrl)
      }
    })
    .catch(() => {
      console.log('[PWA] No internet connection, running in offline mode')
    })
}

// Subscribe to push notifications for enrollment requests
async function subscribeToPushNotifications(registration) {
  try {
    // Check if notifications are supported
    if (!('Notification' in window) || !('PushManager' in window)) {
      console.log('[PWA] Push notifications not supported')
      return
    }

    // Check notification permission
    let permission = Notification.permission

    if (permission === 'default') {
      // Don't request permission immediately, wait for user action
      console.log('[PWA] Notification permission not granted yet')
      return
    }

    if (permission === 'denied') {
      console.log('[PWA] Notification permission denied')
      return
    }

    if (permission === 'granted') {
      // TODO: In a future phase, implement VAPID keys for push notifications
      console.log('[PWA] Ready for push notifications (VAPID keys needed)')
    }
  } catch (error) {
    console.error('[PWA] Error setting up push notifications:', error)
  }
}

// Show update available notification
function showUpdateAvailable() {
  // Create a simple toast notification for updates
  if (window.toast) {
    window.toast.success('New version available! Refresh to update.', {
      duration: 10000,
      icon: '🔄'
    })
  } else {
    console.log('[PWA] New version available')
  }
}

// Show offline ready notification
function showOfflineReady() {
  if (window.toast) {
    window.toast.success('App cached for offline use!', {
      duration: 5000,
      icon: '📱'
    })
  } else {
    console.log('[PWA] App cached for offline use')
  }
}

// Unregister service worker
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister()
        console.log('[PWA] Service worker unregistered')
      })
      .catch(error => {
        console.error('[PWA] Service worker unregistration failed:', error)
      })
  }
}

// Get installation prompt for PWA
let deferredInstallPrompt = null

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] Install prompt available')

  // Prevent Chrome 76+ from automatically showing the prompt
  e.preventDefault()

  // Stash the event so it can be triggered later
  deferredInstallPrompt = e

  // Show custom install button
  showInstallButton()
})

// Show custom install button
function showInstallButton() {
  // Create install button if it doesn't exist
  if (!document.getElementById('pwa-install-btn')) {
    const installBtn = document.createElement('button')
    installBtn.id = 'pwa-install-btn'
    installBtn.innerHTML = '📱 Install App'
    installBtn.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50 text-sm font-medium'
    installBtn.style.display = 'block'

    installBtn.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt()
        const { outcome } = await deferredInstallPrompt.userChoice

        if (outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt')
        } else {
          console.log('[PWA] User dismissed the install prompt')
        }

        deferredInstallPrompt = null
        installBtn.style.display = 'none'
      }
    })

    document.body.appendChild(installBtn)

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (installBtn && installBtn.style.display !== 'none') {
        installBtn.style.display = 'none'
      }
    }, 10000)
  }
}

// Handle app installed event
window.addEventListener('appinstalled', (evt) => {
  console.log('[PWA] App was installed successfully')

  // Hide install button
  const installBtn = document.getElementById('pwa-install-btn')
  if (installBtn) {
    installBtn.style.display = 'none'
  }

  // Track installation
  if (window.gtag) {
    window.gtag('event', 'pwa_installed', {
      event_category: 'PWA',
      event_label: 'SAT Admin Panel'
    })
  }
})