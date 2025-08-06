export async function loadFavicon(url){
	const fallback = '/icons/site.svg'
	if(!url) return fallback
	const dataUrl = await loadImage(url)
	if(dataUrl.startsWith('data:text/html')) return fallback
	return dataUrl
}

const cache = new Map()
async function loadImage(url){
	const cached = cache.get(url)
	if(cached) return cached
	const promise = fetchImage(url)
	cache.set(url, promise)
	const src = await promise
	return src
}

async function fetchImage(url){
	const response = await fetch(url)
	const contentType = response.headers.get('Content-Type')
	const bytes = await response.bytes()
	const dataUrl = `data:${contentType};base64,${bytes.toBase64()}`
	return dataUrl
}
