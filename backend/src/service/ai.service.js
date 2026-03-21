import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function generateTags(title, description) {
    try {
        const prompt = `
            Given this content:
            Title: ${title} 
            Description: ${description}

            Generate exactly 5 relevant tags for this content.
            Return ONLY a JSON array of strings, nothing else.
            Example: ["tag1", "tag2", "tag3", "tag4", "tag5"]
        `

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        })

        const text = response.text.trim()
        const cleanText = text.replace(/```json|```/g, '').trim()
        const tags = JSON.parse(cleanText)

        console.log('Raw Gemini response:', cleanText)

        return Array.isArray(tags) ? tags : []

    } catch (err) {
        return cleanText.split(',').map(t => t.trim()).filter(Boolean)
    }
}

export async function generateEmbedding(text) {
    try {
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: text
        })

        return response.embeddings[0].values

    } catch (err) {
        console.error('Embedding generation failed:', err.message)
        return null
    }
}