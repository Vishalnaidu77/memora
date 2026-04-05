import axios from 'axios';
import * as cheerio from 'cheerio'
import https from 'https'

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
        if(url.includes('youtube.com/watch')){
            const videoId = new URL(url).searchParams.get('v')
            return {
                title: null,
                discription: null,
                image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
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
