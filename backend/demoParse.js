import * as cheerio from 'cheerio'

const url = 'https://www.dsfaisal.com/blog/sql/leetcode-sql-problem-solving'

export async function scrape(){
    const res = await fetch(url)
    const html = await res.text()

    const $ = cheerio.load(html)
    console.log($);
}