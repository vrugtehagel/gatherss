import {saveFeed} from '/-/feed.js'

const {searchParams} = new URL(location.href)
const url = searchParams.get('feedurl')
const name = searchParams.get('feedname')

await saveFeed({url, name})

location.assign('/action/index.html')
