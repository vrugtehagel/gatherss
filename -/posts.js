import {queryDom, getDomType} from './dom.js'
import {getAllFeeds} from './feed.js'
import {getSetting} from './settings.js'

export async function getAllPosts(){
	const feeds = await getAllFeeds()
	const promises = feeds.map(feed => getPosts(feed.url))
	const posts = (await Promise.all(promises)).flat()
	posts.sort((postA, postB) => postB.timestamp - postA.timestamp)
	return posts
}

export async function getPosts(url){
	const {[url]: feed} = await browser.storage.sync.get([url])
	const posts = feed?.posts || await refreshPosts(url)
	return posts.map(post => ({...post, feed}))
}

export async function refreshAllPosts(){
	const feeds = await getAllFeeds()
	const urls = feeds.map(feed => feed.url)
	const storage = await browser.storage.sync.get(urls)
	const timestamps = urls.map(url => storage[url].posts[0]?.timestamp)
	const posts = await Promise.all(urls.map(url => refreshPosts(url)))
	const hasNew = index => posts[index][0]?.timestamp != timestamps[index]
	return posts.some((posts, index) => hasNew(index))
}

export async function refreshPosts(url){
	const {[url]: feed = {}} = await browser.storage.sync.get([url])
	feed.posts ??= []
	const fetched = await fetchPosts(url).catch(() => null)
	if(fetched) delete feed.failed
	else feed.failed = true
	const posts = fetched ?? []
	const isListed = post => feed.posts.some(({href}) => post.href == href)
	const unlisted = posts.filter(post => !isListed(post))
	const now = Date.now()
	unlisted.forEach((post, index) => post.timestamp ??= now + index)
	feed.posts.unshift(...unlisted)
	while(feed.posts.length > 20) feed.posts.pop()
	await browser.storage.sync.set({[url]: feed})
	return feed.posts
}

async function fetchPosts(url){
	const type = await getDomType(url)
	if(type == 'rss') return await fetchRssPosts(url)
	const developerMode = await getSetting('developerMode')
	if(developerMode) return await fetchHtmlPosts(url)
	throw Error(`Feed ${url} seems to no longer be an RSS feed`)
}

async function fetchRssPosts(url){
	const selector = ':is(rss,channel,feed) > :is(entry,item)'
	const items = await queryDom(url, selector)
	const posts = items.map(item => parseRssPost(item))
	posts.sort((postA, postB) => postB.timestamp - postA.timestamp)
	return posts.slice(0, 20)
}

function parseRssPost(item){
	const title = item.querySelector('title')?.textContent
	const link = item.querySelector('link')
	const href = link?.getAttribute('href') || link?.textContent || null
	const pubDate = item.querySelector('published,pubDate')
	const updated = item.querySelector('updated')
	const date = new Date(pubDate?.textContent ?? updated?.textContent)
	const timestamp = Number(date) || null
	return {title, href, timestamp}
}

async function fetchHtmlPosts(url){
	const unfiltered = await queryDom(url, 'a[href]:not([href^="#"])')
	if(unfiltered.length == 0) return []
	const as = unfiltered.filter(a => hasLocalHref(a, url))
	const map = new Map()
	for(const a of as) countAncestors(a.parentNode, map)
	const counts = [...new Set(map.values())].sort().reverse()
	const factors = counts.map((count, index) => count / counts[index + 1])
	factors.pop()
	const maxFactor = Math.max(...factors)
	const maxCount = counts[factors.indexOf(maxFactor)]
	const entries = [...map].filter(([element, count]) => count == maxCount)
	const candidates = entries.map(([element]) => element)
	const depths = candidates.map(candidate => getDepth(candidate))
	const maxDepth = Math.max(depths)
	const parent = candidates[depths.indexOf(maxDepth)]
	const items = [...parent.children].slice(0, 20)
	if(items.length < 8) return []
	const parsedPosts = items.map(item => parseHtmlPost(item, url))
	const posts = parsedPosts.filter(post => post != null)
	posts[0].timestamp = Date.now()
	posts.forEach((post, index) => post.timestamp ??= 0)
	return posts
}

function hasLocalHref(a, url){
	const href = a.getAttribute('href')
	if(!href) return false
	const {origin} = new URL(href, url)
	return url.startsWith(origin)
}

function countAncestors(element, map){
	if(element?.nodeType != Node.ELEMENT_NODE) return
	const count = map.get(element) ?? 0
	map.set(element, count + 1)
	return countAncestors(element.parentNode, map)
}

function getDepth(element){
	if(element?.nodeType != Node.ELEMENT_NODE) return 0
	return getDepth(element.parentNode) + 1
}

function parseHtmlPost(item, pageUrl){
	const [a] = item.querySelectorAll('a')
	const titleSelector = 'h1,h2,h3,h4,h5,h6,[class*=title]'
	const element = item.querySelector(titleSelector) ?? a
	const guess = element.textContent.trim() || item.textContent.trim()
	const title = guess.replaceAll(/\s+/g, ' ')
	const path = a.getAttribute('href')
	if(!URL.canParse(path, pageUrl)) return null
	const {href} = new URL(path, pageUrl)
	return {title, href}
}
