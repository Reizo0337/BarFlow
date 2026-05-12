import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    handleCommand(body: {
        text: string;
        history?: any[];
    }, req: any): Promise<any[]>;
}
