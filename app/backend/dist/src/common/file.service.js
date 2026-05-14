"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
const crypto = __importStar(require("crypto"));
let FileService = class FileService {
    async processAndSaveImage(buffer, targetDir, customFileName) {
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        const fileName = customFileName || `${(0, uuid_1.v4)()}.webp`;
        const filePath = path.join(targetDir, fileName);
        if (customFileName && fs.existsSync(filePath)) {
            return `${targetDir.replace('./', '/')}/${fileName}`;
        }
        await (0, sharp_1.default)(buffer)
            .resize(300, 300, {
            fit: 'cover',
            position: 'center'
        })
            .webp({ quality: 80 })
            .toFile(filePath);
        return `${targetDir.replace('./', '/')}/${fileName}`;
    }
    async downloadAndSaveImage(url, targetDir) {
        if (!url || !url.startsWith('http'))
            return url;
        const urlHash = crypto.createHash('md5').update(url).digest('hex');
        const fileName = `${urlHash}.webp`;
        const filePath = path.join(targetDir, fileName);
        if (fs.existsSync(filePath)) {
            return `${targetDir.replace('./', '/')}/${fileName}`;
        }
        try {
            const response = await (0, axios_1.default)({
                url,
                method: 'GET',
                responseType: 'arraybuffer',
                timeout: 10000
            });
            return await this.processAndSaveImage(Buffer.from(response.data), targetDir, fileName);
        }
        catch (error) {
            console.error('Error downloading/processing image:', error.message);
            return url;
        }
    }
};
exports.FileService = FileService;
exports.FileService = FileService = __decorate([
    (0, common_1.Injectable)()
], FileService);
//# sourceMappingURL=file.service.js.map