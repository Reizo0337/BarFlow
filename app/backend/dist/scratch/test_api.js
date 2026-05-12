"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function test() {
    try {
        const res = await axios_1.default.get('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=mojito');
        console.log(JSON.stringify(res.data, null, 2));
    }
    catch (e) {
        console.error(e.message);
    }
}
test();
//# sourceMappingURL=test_api.js.map