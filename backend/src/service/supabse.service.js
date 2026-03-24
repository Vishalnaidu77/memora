import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

export async function uploadFile(bucketname, objectName, fileBuffer, mimeType){
    try {
        const { data, error } = await supabase.storage
        .from(bucketname)
        .upload(objectName, fileBuffer, {
            contentType: mimeType,
            upsert: false
        })

        if(error){
            throw error
        }

        const { data : { publicUrl } } = supabase.storage
        .from(bucketname)
        .getPublicUrl(objectName)
        
        console.log("File uploaded", publicUrl);
    
        return publicUrl
    } catch (err) {
        console.log("Supabase uplaod error", err.message);
        throw err
    }       
}

export async function downloadFile(bucketname, objectName, filePath) {
    try {
        const { data, error } = await supabase.storage
        .from(bucketname)
        .download(objectName)

        if (error) {
            throw error
        }

        return Buffer.from(await data.arrayBuffer())
    } catch (error) {
        console.log("Download failed", error.message);
        throw error
    }
}
