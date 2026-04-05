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
        }
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

export async function generateSummary(title, description, content, contentType = "other") {
    let cleanText = ''

    try {
        const prompt = `
            You are writing a short library description for a saved item.

            Content type: ${contentType}
            Title: ${title || "Untitled"}
            Existing description: ${description || "None"}
            Extracted content: ${content || "None"}

            Write a concise 1-2 sentence summary.
            Rules:
            - Maximum 280 characters
            - Use plain natural language
            - Do not mention that this was AI generated
            - Do not use bullet points
            - Return only the summary text
        `

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        })

        cleanText = response.text.trim().replace(/[`"]/g, '')
        return cleanText || ''
    } catch (err) {
        console.error('generateSummary failed:', err.message, 'Raw:', cleanText)
        return ''
    }
}

export async function generateTopicLabel(clusterItems) {
    let cleanText = ''

    try {
        const itemsSummary = clusterItems
            .map((item, index) => {
                const title = item.payload?.title || 'Untitled'
                const tags = (item.payload?.tags || []).slice(0, 5).join(', ')
                return `${index + 1}. Title: ${title}\nTags: ${tags || 'None'}`
            })
            .join('\n\n')

        const prompt = `
            These items belong to the same topic cluster:

            ${itemsSummary}

            Generate one short topic label for this cluster.
            Rules:
            - Maximum 4 words
            - Use plain readable words
            - Do not use quotes
            - Return only the label text
        `

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        })

        cleanText = response.text.trim().replace(/["`]/g, '')
        return cleanText || 'General'
    } catch (err) {
        console.error('generateTopicLabel failed:', err.message, 'Raw:', cleanText)
        return null
    }
}
