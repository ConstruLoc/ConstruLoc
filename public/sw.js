// Service Worker para ConstruLoc PWA
const CACHE_NAME = "construloc-v1"
const urlsToCache = [
  "/",
  "/dashboard",
  "/equipamentos",
  "/categorias",
  "/catalogo",
  "/clientes",
  "/contratos",
  "/pagamentos",
  "/relatorios",
  "/configuracoes",
  "/images/logo-construloc.png",
  "/construloc-logo.png",
]

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching app shell")
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.log("[SW] Cache failed:", error)
      }),
  )
  self.skipWaiting()
})

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  return self.clients.claim()
})

// Estratégia de cache: Network First, fallback para Cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone a resposta
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) {
            return response
          }
          // Retorna uma resposta padrão se não houver cache
          return new Response("Offline - Conteúdo não disponível", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          })
        })
      }),
  )
})

self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", event)

  const data = event.data ? event.data.json() : {}
  const title = data.title || "ConstruLoc"
  const options = {
    body: data.body || "Você tem uma nova notificação",
    icon: data.icon || "/logo.png",
    badge: "/logo.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/dashboard",
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Abrir",
      },
      {
        action: "close",
        title: "Fechar",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event)

  event.notification.close()

  if (event.action === "close") {
    return
  }

  const urlToOpen = event.notification.data?.url || "/dashboard"

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Se já existe uma janela aberta, foca nela
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus()
          }
        }
        // Caso contrário, abre uma nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})
