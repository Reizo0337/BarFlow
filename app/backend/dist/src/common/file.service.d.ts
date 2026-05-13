export declare class FileService {
    processAndSaveImage(buffer: Buffer, targetDir: string): Promise<string>;
    downloadAndSaveImage(url: string, targetDir: string): Promise<string>;
}
