import {saveFeed} from '/utils/feed.js'
import {getTitle} from '/utils/home.js'

const form = document.querySelector('form')
const {searchParams} = new URL(location.href)
const feedUrl = searchParams.get('feedurl')
form.elements.feedurl.value = feedUrl

const title = await getTitle(feedUrl)
form.classList.remove('loading')
form.elements.submit.disabled = false
form.elements.feedname.value = title
form.elements.feedname.disabled = false
form.elements.feedname.focus()
