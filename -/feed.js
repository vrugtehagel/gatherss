import {queryDom, getDomType} from './dom.js'
import {getIcon} from './home.js'
import {refreshPosts} from './posts.js'

export async function findRssFeed(url){
	if(url.match(/^\w+\.\w/)) url = `https://${url}`
	const type = await getDomType(url)
	const isRss = type == 'rss'
	if(isRss) return url
	const links = await queryDom(url, 'link[rel=alternate]')
	const contentType = /^application\/((atom|rss)\+)?xml\b/
	const [link] = links.filter(link => contentType.test(link.type))
	if(!link) return ''
	const {origin} = new URL(url)
	const path = link.getAttribute('href')
	if(!URL.canParse(path, origin)) return ''
	const {href} = new URL(path, origin)
	return href
}

export async function saveFeed({url, name}){
	const stored = await browser.storage.sync.get([url])
	if(stored[url]) return
	const icon = await getIcon(url)
	const feed = {url, icon, name}
	await browser.storage.sync.set({[url]: feed})
	await refreshPosts(url)
}

export async function getFeed(url){
	const {[url]: feed} = await browser.storage.sync.get([url])
	return feed ?? null
}

export async function getAllFeeds(){
	const storage = await browser.storage.sync.get()
	const keys = Object.keys(storage)
	const urls = keys.filter(key => key.includes(':'))
	const feeds = urls.map(url => storage[url])
	return feeds
}

export async function removeFeed(url){
	await browser.storage.sync.remove([url])
}
