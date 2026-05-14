import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import * as crypto from 'crypto';

@Injectable()
export class FileService {
    async processAndSaveImage(buffer: Buffer, targetDir: string, customFileName?: string): Promise<string> {
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const fileName = customFileName || `${uuidv4()}.webp`;
        const filePath = path.join(targetDir, fileName);

        // If it already exists and we have a custom name, don't re-process
        if (customFileName && fs.existsSync(filePath)) {
            return `${targetDir.replace('./', '/')}/${fileName}`;
        }

        // OPTIMIZATION: Resize to 300x300, convert to webp (quality 80)
        await sharp(buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 80 })
            .toFile(filePath);

        return `${targetDir.replace('./', '/')}/${fileName}`;
    }

    async downloadAndSaveImage(url: string, targetDir: string): Promise<string> {
        if (!url || !url.startsWith('http')) return url;

        // Generate a unique filename based on the URL hash
        const urlHash = crypto.createHash('md5').update(url).digest('hex');
        const fileName = `${urlHash}.webp`;
        const filePath = path.join(targetDir, fileName);

        // Check if we already have this image
        if (fs.existsSync(filePath)) {
            return `${targetDir.replace('./', '/')}/${fileName}`;
        }

        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'arraybuffer', // Get as buffer for sharp
                timeout: 10000
            });

            return await this.processAndSaveImage(Buffer.from(response.data), targetDir, fileName);
        } catch (error) {
            console.error('Error downloading/processing image:', error.message);
            return url;
        }
    }
}
