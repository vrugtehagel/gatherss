import {getAllFeeds} from '/-/feed.js'
import {loadImage} from '/-/image.js'
import {importOpml, exportOpml} from '/-/opml.js'
import {setSetting, getAllSettings} from '/-/settings.js'

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

form.elements.unreaddot.checked = settings.unreadDot
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

const {searchParams} = new URL(location)
const isPopup = !searchParams.has('tab')
document.querySelector('#open-tab-warning').hidden = !isPopup
document.querySelector('#import-export a').href = exportOpml(feeds)
document.querySelector('#import-export input').disabled = isPopup
document.querySelector('#import-export input').oninput = async event => {
	const input = event.target
	const [label] = input.labels
	const [file] = input.files
	input.disabled = file != null
	if(!file) return
	const source = await file.text()
	await importOpml(source)
	input.disabled = false
	location.reload()
}
