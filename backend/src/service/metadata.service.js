import axios from 'axios';
import * as cheerio from 'cheerio'
import https from 'https'

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

        return {
            title: $('meta[property="og:title"]').attr('content') || $('title').text() || "",
            description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]') || "",
            image: $('meta[property="og:image"]').attr('content') || '',
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
