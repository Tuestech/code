var CACHE_NAME = 'tues-cache-v7';
var OFFLINE_NAME = 'tues-offline-cache-v7';
var allowed_caches = [CACHE_NAME, OFFLINE_NAME]

var urlsToCache = [
	'/static/Images/fast_forward.svg',
	'/static/Images/fast_rewind.svg',
  '/static/Images/Favicon Dark.png',
  '/static/Images/Favicon Light.png',
  '/static/Images/Google Dashboard Icon.png',
  '/static/Images/Google Delete Icon.png',
  '/static/Images/Google Edit Icon.png',
  '/static/Images/Google Settings Icon.png',
  '/static/Images/Google Tasks Icon.png',
  '/static/Images/Google Web Icon.png',
  '/static/Images/google-classroom.svg',
  '/static/Images/New Button.png',
  '/static/Images/New_Delete_Button.png',
	'/static/Images/New_Edit_Button.png',
	'/static/Images/pause.svg',
	'/static/Images/play.svg',
  '/static/Images/prog_curve option 1 blue.png',
  '/static/Images/prog_curve option 2 blue.png',
  '/static/Images/prog_curve option 3 blue.png',
  '/static/Images/prog_curve option 4 blue.png',
  '/static/Images/ps_logo_lg.png',
  '/static/Images/Setup Favicon.png',
  '/static/Images/Tuesday Logo Modern Angles with Box (gray).png',
  '/static/Images/Tuesday Logo Modern Angles.png',
	'/static/Lexend.css',
	'/static/Roboto.css',
	'/static/Ding.mp3'
];

var offlineUrls = [
	'/',
	'/static/styles.css'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache)
      })
			.then(function() {
				caches.open(OFFLINE_NAME)
					.then(function(cache) {
						return cache.addAll(offlineUrls)
					})
			})
  )
})

self.addEventListener('activate', function(event) {
	// Claim all active
	self.clients.claim()
	
	// Delete all non-allowed caches
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (allowed_caches.indexOf(cacheName) == -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(

    caches.open(CACHE_NAME).then(function(cache) {
			console.log("good 1")

			return cache.match(event.request).then(function(response) {
        if (response) {
					console.log("response found")
          return response
        } else if (navigator.onLine) {
					console.log("fetching")
					return fetch(event.request)
				} else {
					console.log("bruh")
					return
					return caches.match(event.request).then(function(response) {
							if (response) {
								return response
							} else {
								return caches.match("/")
							}
						}).catch(function() {
							return fetch(event.request)
						})
				}
      })

		}).catch(function() {
			console.log("bruh momentium")
			return fetch(event.request)
		})

  )
})