import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

@Injectable()
export class FileService {
    async processAndSaveImage(buffer: Buffer, targetDir: string): Promise<string> {
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const fileName = `${uuidv4()}.webp`;
        const filePath = path.join(targetDir, fileName);

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

        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'arraybuffer', // Get as buffer for sharp
                timeout: 10000
            });

            return await this.processAndSaveImage(Buffer.from(response.data), targetDir);
        } catch (error) {
            console.error('Error downloading/processing image:', error.message);
            return url;
        }
    }
}
