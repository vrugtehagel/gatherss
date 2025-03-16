import {refreshAllPosts} from '/utils/posts.js'
import {getSetting, setSetting} from '/utils/settings.js'

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
	if(tab.active) checkForRssFeed(tab.id)
}, {properties: ['url', 'status']})

browser.tabs.onActivated.addListener(({tabId}) => {
	checkForRssFeed(tabId)
})

browser.alarms.create({periodInMinutes: 30})
browser.alarms.onAlarm.addListener(refresh)

browser.runtime.onMessage.addListener(message => {
	if(message.type != 'rsscheck') return
	const querying = browser.tabs.query({active: true, currentWindow: true})
	querying.then(([tab]) => checkForRssFeed(tab.id))
})

async function checkForRssFeed(tabId){
	const unread = await getSetting('unread')
	if(unread) return
	const message = {type: 'feeddetect'}
	const responding = browser.tabs.sendMessage(tabId, message)
	const response = await responding.catch(() => null)
	const {feedUrl} = response ?? {}
	if(!feedUrl) return browser.action.setIcon({path: '/icons/rss.svg'})
	const storage = await browser.storage.sync.get([feedUrl])
	const discoveryDot = await getSetting('discoveryDot')
	const showDot = !(feedUrl in storage) && discoveryDot
	const path = showDot ? '/icons/rss-available.svg' : '/icons/rss.svg'
	browser.action.setIcon({path})
}

async function refresh(){
	const delay = new Promise(resolve => setTimeout(resolve, 1000))
	browser.action.setIcon({path: '/icons/sync.svg'})
	const unreadDot = await getSetting('unreadDot')
	if(!unreadDot) return browser.action.setIcon({path: '/icons/rss.svg'})
	const unreadSetting = await getSetting('unread')
	const newUnread = await refreshAllPosts()
	console.log({unreadSetting, newUnread})
	if(!unreadSetting && newUnread) await setSetting('unread', true)
	const unread = unreadSetting || newUnread
	const path = unread ? '/icons/rss-unread.svg' : '/icons/rss.svg'
	await delay
	browser.action.setIcon({path})
}
