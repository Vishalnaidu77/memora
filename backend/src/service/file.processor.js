import { PDFParse } from 'pdf-parse'
import axios from 'axios'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function extractTextFromPdf(fileUrl) {
    try {
        const res = await axios.get(fileUrl, {
            responseType: 'arraybuffer'
        })

        const buffer = Buffer.from(res.data)
        const parser = new PDFParse({ data: buffer })
        const data = await parser.getText()
        await parser.destroy()

        return data.text
    } catch (err) {
        console.log("PDF extraction failed:", err.message);
        return null        
    }
}

export async function extractTextFromImage(fileUrl, mimeType = 'image/jpeg') {
    try {
        const res = await axios.get(fileUrl, {
            responseType: 'arraybuffer'
        })

        const base64 = Buffer.from(res.data).toString('base64')

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64
                            }
                        },
                        {
                            text: "Describe this image in detail. Extract any text visible in the image."
                        }
                    ]
                }
            ]
        })

        return result.text || null

    } catch (err) {
        console.error("Image extraction failed:", err.message);
        return null;
    }
}
