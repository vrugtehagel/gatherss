const cache = new Map()
const parser = new DOMParser()

export async function queryDom(url, selector){
	const dom = await fetchDom(url)
	if(!dom) return []
	return [...dom.querySelectorAll(selector)]
}

export async function fetchDom(url){
	if(!URL.canParse(url)) return null
	const cached = cache.get(url)
	const value = cached?.deref()
	if(value) return value
	cache.delete(url)
	const response = await fetch(url).catch(() => null)
	if(!response?.ok) return null
	const source = await response.text()
	const contentType = response.headers.get('Content-Type').trim()
	const type = contentType.startsWith('text/html') ? 'text/html' : 'text/xml'
	const dom = parser.parseFromString(source, type)
	cache.set(url, new WeakRef(dom))
	return dom
}

export async function getDomType(url){
	const dom = await fetchDom(url)
	if(!dom) return ''
	const namespace = dom.documentElement.namespaceURI
	if(namespace == 'http://www.w3.org/1999/xhtml') return 'html'
	return 'rss'
}
