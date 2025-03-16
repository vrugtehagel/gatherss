import {getAllPosts, refreshAllPosts} from '/utils/posts.js'
import {loadImage} from '/utils/image.js'
import {setSetting} from '/utils/settings.js'

const nav = document.querySelector('#posts')
await resetListItems()

async function resetListItems(){
	const posts = await getAllPosts()
	nav.replaceChildren()
	window.scrollTo(0, 0)
	createListItemBatch(posts, 0)
}

function createListItemBatch(posts, page, oldObserver){
	const as = posts.slice(page * 20, (page + 1) * 20).map(createListItem)
	if(as.length == 0) return
	nav.append(...as)
	const observer = new IntersectionObserver(([{isIntersecting}]) => {
		if(!isIntersecting) return
		createListItemBatch(posts, page + 1)
		observer.disconnect()
	})
	observer.observe(as[0])
}

function createListItem(post){
	const a = document.createElement('a')
	const img = document.createElement('img')
	const span = document.createElement('span')
	img.src = '/icons/site.svg'
	img.alt = ''
	img.width = img.height = 16
	if(post.feed.icon) loadImage(post.feed.icon).then(src => img.src = src)
	span.textContent = post.title
	a.href = post.href
	a.title = post.title
	a.append(img, span)
	return a
}

const refresh = document.querySelector('#refresh')
refresh.disabled = false
refresh.onclick = async () => {
	const img = refresh.querySelector('img')
	refresh.disabled = true
	img.src = '/icons/spinner.svg'
	await refreshAllPosts()
	await resetListItems()
	img.src = '/icons/sync.svg'
}


await setSetting('unread', false)
browser.runtime.sendMessage({type: 'rsscheck'})
