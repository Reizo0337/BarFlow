"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartImageService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let SmartImageService = class SmartImageService {
    cocktailApi = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';
    mealApi = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
    async findImage(query) {
        try {
            const cocktailRes = await axios_1.default.get(`${this.cocktailApi}${encodeURIComponent(query)}`);
            if (cocktailRes.data.drinks && cocktailRes.data.drinks[0]) {
                return cocktailRes.data.drinks[0].strDrinkThumb;
            }
            const mealRes = await axios_1.default.get(`${this.mealApi}${encodeURIComponent(query)}`);
            if (mealRes.data.meals && mealRes.data.meals[0]) {
                return mealRes.data.meals[0].strMealThumb;
            }
            return `https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800&keyword=${encodeURIComponent(query)}`;
        }
        catch (error) {
            console.error('SmartImageService error:', error.message);
            return null;
        }
    }
};
exports.SmartImageService = SmartImageService;
exports.SmartImageService = SmartImageService = __decorate([
    (0, common_1.Injectable)()
], SmartImageService);
//# sourceMappingURL=smart-image.service.js.map