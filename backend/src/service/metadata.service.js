import axios from 'axios';
import * as cheerio from 'cheerio'
import https from 'https'

function getYouTubeVideoId(url) {
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase()

        if (host === 'youtu.be') {
            return parsed.pathname.split('/').filter(Boolean)[0] || null
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (parsed.pathname === '/watch') {
                return parsed.searchParams.get('v')
            }

            const segments = parsed.pathname.split('/').filter(Boolean)
            if (['shorts', 'embed', 'live'].includes(segments[0])) {
                return segments[1] || null
            }
        }

        return null
    } catch {
        return null
    }
}

function toAbsoluteUrl(baseUrl, candidateUrl) {
    if (!candidateUrl || typeof candidateUrl !== 'string') {
        return ''
    }

    const cleaned = candidateUrl.trim()
    if (!cleaned) {
        return ''
    }

    try {
        return new URL(cleaned, baseUrl).toString()
    } catch {
        return ''
    }
}

export async function fetchMatadata(url){
    try {
        const youtubeVideoId = getYouTubeVideoId(url)

        if(youtubeVideoId){
            return {
                title: null,
                description: null,
                image: `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`,
                contentType: 'video'
            }
        }

        const { data } = await axios.get(url, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 10000,
            headers: {
                'User-agent': 'Mozilla/5.0'
            }
        })

        const $ = cheerio.load(data)
        const description =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            ''

        const rawImage =
            $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('link[rel="image_src"]').attr('href') ||
            ''

        const image = toAbsoluteUrl(url, rawImage)

        return {
            title: $('meta[property="og:title"]').attr('content') || $('title').text() || "",
            description,
            image,
            siteName: $('meta[property="og:site_name"]').attr('content') || '',
        }
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            throw new Error('URL timeout — site too slow')
        }
        
        if (err.response?.status === 403) {
            throw new Error('Site blocked scraping')
        }
        if (err.code === 'ERR_INVALID_URL') {
            throw new Error('Invalid URL')
        }
        throw err
    }
}
