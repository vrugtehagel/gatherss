import {getFeed, removeFeed} from '/utils/feed.js'
import {refreshPosts} from '/utils/posts.js'

const {searchParams} = new URL(location.href)
const feedUrl = searchParams.get('feedurl')
const feed = await getFeed(feedUrl)
if(!feed) location.assign('../index.html')
const form = document.querySelector('form')
form.elements.feedurl.value = feed.url
form.elements.feedname.value = feed.name
form.elements.feedname.disabled = false
form.classList.remove('loading')

form.onsubmit = async event => {
	event.preventDefault()
	const url = form.elements.feedurl.value
	const name = form.elements.feedname.value
	await updateFeed(feedUrl, {url, name})
	location.assign('../index.html')
}

const refresh = document.querySelector('#refresh-feed')
refresh.onclick = async () => {
	const img = refresh.querySelector('img')
	refresh.disabled = true
	img.src = '/icons/spinner.svg'
	await refreshPosts(feedUrl)
	img.src = '/icons/sync.svg'
}

const remove = document.querySelector('#remove-feed')
remove.onclick = async () => {
	await removeFeed(feedUrl)
	location.assign('../index.html')
}
