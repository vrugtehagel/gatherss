import {findRssFeed} from '/utils/feed.js'

const form = document.querySelector('form')
const message = document.querySelector('form #message')

form.elements.feedurl.addEventListener('input', () => {
	form.elements.submit.disabled = true
})
form.onsubmit = async event => {
	if(!form.elements.submit.disabled) return
	event?.preventDefault()
	const url = form.elements.feedurl.value
	form.classList.add('loading')
	const feedUrl = await findRssFeed(url)
	const ok = feedUrl == url
	form.elements.submit.disabled = !ok
	form.classList.remove('loading')
	if(!feedUrl) return message.textContent = 'No feed found'
	if(ok) return message.textContent = ''
	const button = document.createElement('button')
	button.onclick = () => form.elements.feedurl.value = feedUrl
	button.textContent = feedUrl
	button.classList.add('link')
	message.replaceChildren('Did you mean: ', button)
}

const [tab] = await browser.tabs.query({active: true, currentWindow: true})
const responding = browser.tabs.sendMessage(tab.id, {type: 'feeddetect'})
const response = await responding.catch(e => e.message)
const {feedUrl} = response ?? {}
form.elements.feedurl.value = feedUrl || ''
form.classList.remove('loading')
form.elements.feedurl.disabled = false
if(feedUrl) form.onsubmit()
