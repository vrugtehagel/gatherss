import {queryDom} from './dom.js'

export async function getIcon(url){
	const {origin} = new URL(url)
	const links = await queryDom(origin, 'link[rel=icon]')
	if(links.length == 0) return ''
	const link = links.find(link => link.type == 'image/svg+xml') ?? links[0]
	if(!URL.canParse(link.getAttribute('href'), origin)) return ''
	const {href} = new URL(link.getAttribute('href'), origin)
	return href
}

export async function getTitle(url){
	const ogTitle = await getOGTitle(url)
	if(ogTitle) return ogTitle
	const fullTitle = await getFullTitle(url)
	const title = fullTitle.split('|').at(-1)
	if(title) return title
	const {hostname} = new URL(url)
	return hostname
}

async function getFullTitle(url){
	const {origin} = new URL(url)
	const [title] = await queryDom(origin, 'title')
	return title?.textContent ?? ''
}

async function getOGTitle(url){
	const {origin} = new URL(url)
	const metas = await queryDom(origin, 'meta[property="og:site_name"]')
	return metas[0]?.content ?? ''
}
