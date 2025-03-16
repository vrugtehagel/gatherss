const links = [...document.querySelectorAll('link[rel=alternate]')]
const contentType = /^application\/((atom|rss)\+)?xml\b/
const [link] = links.filter(link => contentType.test(link.type))
const {origin} = location
const path = link.getAttribute('href')
const feedUrl = URL.canParse(path, origin) ? new URL(path, origin).href : ''

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if(message.type != 'feeddetect') return
	sendResponse({feedUrl})
})
