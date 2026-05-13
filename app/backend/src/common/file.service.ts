import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
    async downloadAndSaveImage(url: string, targetDir: string): Promise<string> {
        if (!url || !url.startsWith('http')) return url;

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                timeout: 5000
            });

            const fileName = `${uuidv4()}.jpg`;
            const filePath = path.join(targetDir, fileName);
            const writer = fs.createWriteStream(filePath);

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(`${targetDir.replace('./', '/')}/${fileName}`));
                writer.on('error', (err) => {
                    console.error('Writer error:', err.message);
                    resolve(url);
                });
            });
        } catch (error) {
            console.error('Error downloading image:', error.message);
            return url;
        }
    }
}
