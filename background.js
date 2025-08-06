import {refreshAllPosts} from '/-/posts.js'
import {getSetting, setSetting} from '/-/settings.js'

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
	if(tab.active) checkForRssFeed(tab)
}, {properties: ['url', 'status']})

browser.tabs.onActivated.addListener(({tabId}) => {
	browser.tabs.get(tabId).then(checkForRssFeed).catch(() => null)
})

browser.runtime.onMessage.addListener(message => {
	if(message.type != 'rsscheck') return
	const querying = browser.tabs.query({active: true})
	querying.then(tabs => tabs.forEach(tab => checkForRssFeed(tab)))
})

const icons = {
	default: '/icons/rss.svg',
	available: '/icons/rss-available.svg',
	unread: '/icons/rss-unread.svg',
}

async function checkForRssFeed(tab){
	const unread = await getSetting('unread')
	if(unread) return
	const message = {type: 'feeddetect'}
	const responding = browser.tabs.sendMessage(tab.id, message)
	const response = await responding.catch(() => null)
	const {feedUrl} = response ?? {}
	const windowId = tab.windowId
	console.log(windowId)
	if(!feedUrl) return browser.action.setIcon({path: icons.default, windowId})
	const storage = await browser.storage.sync.get([feedUrl])
	const discoveryDot = await getSetting('discoveryDot')
	const showDot = !(feedUrl in storage) && discoveryDot
	const path = showDot ? icons.available : icons.default
	browser.action.setIcon({path, windowId})
}

browser.alarms.create({periodInMinutes: .1})
browser.alarms.onAlarm.addListener(async () => {
	const unreadDot = await getSetting('unreadDot')
	if(!unreadDot) return
	const unreadSetting = await getSetting('unread')
	const newUnread = await refreshAllPosts()
	if(!unreadSetting && newUnread) await setSetting('unread', true)
	const unread = unreadSetting || newUnread
	if(!unread) return
	const path = icons.unread
	const windows = await browser.windows.getAll()
	const windowIds = windows.map(({id}) => id)
	windowIds.forEach(windowId => browser.action.setIcon({path, windowId}))
})
