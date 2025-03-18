import {saveFeed, getAllFeeds} from './feed.js'

export async function importOpml(source){
	const parser = new DOMParser()
	const dom = parser.parseFromString(source, 'text/xml')
	const root = dom.querySelector(':root')
	if(root.localName != 'opml') throw Error('Not an OPML file')
	const selector = 'outline[xmlUrl][text]:not([text=""])'
	const outlines = [...dom.querySelectorAll(selector)]
	const feeds = outlines.map(outline => parseOutline(outline))
	const delay = new Promise(resolve => setTimeout(resolve, 1000))
	await Promise.allSettled(feeds.map(feed => saveFeed(feed)))
	await delay
}

function parseOutline(outline){
	const name = outline.getAttribute('text') ?? 'Untitled feed'
	const url = outline.getAttribute('xmlUrl')
	return {name, url}
}

export function exportOpml(feeds){
	const xmlDeclaration = '<?xml version="1.0"?>'
	const opmlStart = '<opml version="1.0">'
	const headStart = '<head>'
	const title = '<title>Feeds gathered by Gatherss</title>'
	const headEnd = '</head>'
	const bodyStart = '<body>'
	const outlines = feeds.map(feed => createOutline(feed))
	const bodyEnd = '</body>'
	const opmlEnd = '</opml>'
	const head = `\t${headStart}\n\t\t${title}\n\t${headEnd}`
	const body = `\t${bodyStart}\n\t\t${outlines.join('\n\t\t')}\n\t${bodyEnd}`
	const opml = `${opmlStart}\n${head}\n${body}\n${opmlEnd}`
	const source = `${xmlDeclaration}\n${opml}\n`
	const base64 = btoa(source)
	const dataUrl = `data:text/xml;base64,${base64}`
	return dataUrl
}

function createOutline(feed){
	const text = `text="${feed.name}"`
	const xmlUrl = `xmlUrl="${feed.url}"`
	const type = 'type="rss"'
	const outline = `<outline ${type} ${text} ${xmlUrl} />`
	return outline
}
