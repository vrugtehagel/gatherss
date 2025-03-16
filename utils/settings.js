const defaults = {
	discoveryDot: true,
	unreadDot: true,
	developerMode: false,
	unread: false,
}

export async function getSetting(setting){
	const {settings = {}} = await browser.storage.sync.get(['settings'])
	return settings[setting] ?? defaults[setting] ?? null
}

export async function setSetting(setting, value){
	const {settings = {}} = await browser.storage.sync.get(['settings'])
	settings[setting] = value
	await browser.storage.sync.set({settings})
}

export async function getAllSettings(){
	const {settings} = await browser.storage.sync.get(['settings'])
	return {...defaults, ...settings}
}
