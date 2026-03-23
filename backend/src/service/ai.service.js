import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function generateTags(title, description) {
    let cleanText = '';
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
        cleanText = text.replace(/```json|```/g, '').trim()
        let tags = [];
        try {
            tags = JSON.parse(cleanText)
        } catch (parseErr) {
            console.error('Failed to parse tags JSON:', cleanText, parseErr.message)
            // fallback below
        }
        console.log('Raw Gemini response:', cleanText)
        // Ensure tags is an array of strings
        if (Array.isArray(tags) && tags.every(t => typeof t === 'string')) {
            return tags;
        }
        // fallback: try to split by comma
        tags = cleanText.split(',').map(t => t.replace(/\[|\]|"/g, '').trim()).filter(Boolean)
        if (Array.isArray(tags) && tags.length > 0) {
            return tags;
        }
        return [];
    } catch (err) {
        console.error('generateTags failed:', err.message, 'Raw:', cleanText)
        return [];
    }
}

export async function generateEmbedding(text) {
    try {
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: text,
            config: { outputDimensionality: 768 }
        })

        return response.embeddings[0].values

    } catch (err) {
        console.error('Embedding generation failed:', err.message)
        return null
    }
}