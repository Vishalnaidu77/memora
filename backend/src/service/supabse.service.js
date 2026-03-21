import fs from 'fs'
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

export async function uploadFile(bucketname, objectName, filePath){
    try {
        const fileContent = fs.readFileSync(filePath)

        const { data, error } = await supabase.storage
        .from(bucketname)
        .upload(objectName, fileContent)

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

        fs.writeFileSync(downloadPath, Buffer.from(await data.arrayBuffer()))
        console.log("Download file successfully", downloadPath);
    } catch (error) {
        console.log("Download failed", error.message);
        throw error
    }
}