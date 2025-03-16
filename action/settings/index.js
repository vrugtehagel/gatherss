import {getAllFeeds} from '/utils/feed.js'
import {loadImage} from '/utils/image.js'
import {setSetting, getAllSettings} from '/utils/settings.js'

const form = document.querySelector('form')
const nav = document.querySelector('#feeds')
const feeds = await getAllFeeds()
const settings = await getAllSettings()

feeds.sort((feedA, feedB) => feedA.name.localeCompare(feedB.name))
nav.replaceChildren(...feeds.map(feed => {
	const a = document.createElement('a')
	const img = document.createElement('img')
	const span = document.createElement('span')
	img.src = '/icons/site.svg'
	img.alt = ''
	img.width = img.height = 16
	if(feed.icon) loadImage(feed.icon).then(src => img.src = src)
	span.textContent = feed.name
	const url = new URL('./edit/index.html', location)
	url.searchParams.set('feedurl', feed.url)
	a.href = url.href
	a.title = feed.name
	a.append(img, span)
	return a
}))

form.elements.unreaddot.checked = settings.discoveryDot
form.elements.unreaddot.onchange = () => {
	setSetting('unreadDot', form.elements.unreaddot.checked)
}

form.elements.discoverydot.checked = settings.discoveryDot
form.elements.discoverydot.onchange = () => {
	setSetting('discoveryDot', form.elements.discoverydot.checked)
}

form.elements.developermode.checked = settings.developerMode
form.elements.developermode.onchange = () => {
	setSetting('developerMode', form.elements.developermode.checked)
}
