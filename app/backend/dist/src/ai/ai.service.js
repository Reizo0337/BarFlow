"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const inventory_service_1 = require("../inventory/inventory.service");
const smart_image_service_1 = require("./smart-image.service");
let AiService = AiService_1 = class AiService {
    inventoryService;
    smartImageService;
    logger = new common_1.Logger(AiService_1.name);
    apiKey = process.env.OPENROUTER_API_KEY;
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    constructor(inventoryService, smartImageService) {
        this.inventoryService = inventoryService;
        this.smartImageService = smartImageService;
    }
    async processCommand(text, companyId, history = []) {
        const systemPrompt = `
Eres el "BarFlow Intelligence Manager", un experto en gestión de inventarios para bares y restaurantes de alta gama.
Tu objetivo es ayudar al usuario a gestionar su stock de forma ultra-eficiente y profesional.

PERSONALIDAD:
- Eres preciso, servicial y experto.
- Hablas en español de forma profesional pero cercana.
- Priorizas la seguridad de los datos (confirmas antes de borrar).

TAREAS:
1. Analizar el lenguaje natural del usuario.
2. Mapear las intenciones a las herramientas (TOOLS) disponibles.
3. Devolver SIEMPRE un objeto JSON estructurado con un array "actions".

TOOLS:
1. create_product: { name, stock, price, categoryName } -> Crea un producto. El usuario subirá la foto después.
2. update_product: { product (name), newName, price, categoryName } -> Modifica CUALQUIER propiedad.
3. update_stock: { product (name), quantity (number), operation ("add" | "remove" | "set") } -> Gestiona entradas/salidas de stock.
4. update_price: { product (name), price (number) } -> Actualiza el precio.
5. delete_product: { product (name) } -> REQUIERE CONFIRMACIÓN.
6. create_category: { name } -> Crea una categoría oficial.
7. update_category: { oldName, newName } -> Renombra una categoría.
8. delete_category: { name } -> REQUIERE CONFIRMACIÓN.
9. get_low_stock: { threshold (number) } -> Lista productos agotándose.
10. search_products: { query (string) } -> Busca info de un producto o stock.
11. bulk_update_products: { categoryName (optional), priceAdjustment (number, percentage like 15 for +15%), stockAdjustment (number) } -> Actualiza masivamente.
12. request_confirmation: { action, details, message } -> Úsalo antes de borrar o cambios masivos.
13. chat_response: { message (string) } -> Respuestas generales o dudas.

REGLAS CRÍTICAS:
- Responde ÚNICAMENTE en formato JSON. No añadas texto fuera del JSON.
- No uses términos técnicos como "intent", "request_confirmation" o prefijos como "Error:" en los campos "message" dirigidos al usuario.
- ANTES de ejecutar 'create_product', usa SIEMPRE 'request_confirmation' para que el usuario valide los datos y pueda subir su propia foto.
- Si la orden es ambigua, usa 'chat_response' para preguntar.
- Antes de 'delete_product', 'delete_category' o 'bulk_update_products', usa 'request_confirmation'.
- Si el usuario confirma una acción previa (ej: "Sí", "Hazlo"), ejecuta la acción real guardada en el historial.

EJEMPLO DE SALIDA:
{
  "actions": [
    { "intent": "request_confirmation", "data": { "intent": "create_product", "name": "Mojito", "price": 8, "stock": 10 }, "message": "He preparado los detalles para el Mojito. ¿Son correctos? Puedes subir la foto ahora." }
  ]
}
`;
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text }
        ];
        try {
            const response = await axios_1.default.post(this.apiUrl, {
                model: 'openai/gpt-4o-mini',
                messages,
                response_format: { type: 'json_object' }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://barflow.app',
                    'X-Title': 'BarFlow AI'
                }
            });
            let rawContent = response.data.choices[0].message.content;
            let actionsArray = [];
            try {
                const parsed = JSON.parse(rawContent);
                actionsArray = parsed.actions || (Array.isArray(parsed) ? parsed : [parsed]);
            }
            catch (e) {
                return [{ intent: 'chat_response', status: 'success', message: rawContent }];
            }
            const results = [];
            for (const action of actionsArray) {
                const result = await this.executeAction(action, companyId);
                results.push(result);
            }
            return results;
        }
        catch (error) {
            this.logger.error('Error processing AI command:', error.response?.data || error.message);
            return [{ intent: 'error', status: 'error', message: 'Error de comunicación con el motor de IA.' }];
        }
    }
    async executeAction(action, companyId) {
        const { intent, data } = action;
        try {
            switch (intent) {
                case 'create_product':
                    const newProd = await this.inventoryService.create(data, companyId);
                    return { ...action, status: 'success', result: newProd };
                case 'request_confirmation':
                    const confData = action.data || action;
                    if (confData.intent === 'create_product' || action.intent === 'create_product') {
                        const productName = confData.name || action.name;
                        if (productName) {
                            const existing = await this.inventoryService.findGlobalByName(productName);
                            if (existing && existing.image) {
                                if (action.data)
                                    action.data.image = existing.image;
                                else
                                    action.image = existing.image;
                                action.message = `He preparado "${productName}". He encontrado una imagen sugerida en el sistema. ¿Es correcta?`;
                            }
                        }
                    }
                    return { ...action, status: 'pending_confirmation' };
                case 'update_product':
                    const pToUpdate = await this.inventoryService.findByName(data.product, companyId);
                    if (!pToUpdate)
                        return { ...action, status: 'error', message: `Producto "${data.product}" no encontrado.` };
                    const updateData = {};
                    if (data.newName)
                        updateData.name = data.newName;
                    if (data.price !== undefined)
                        updateData.price = data.price;
                    if (data.categoryName)
                        updateData.categoryName = data.categoryName;
                    if (data.image)
                        updateData.image = data.image;
                    const updated = await this.inventoryService.update(pToUpdate.id, updateData, companyId);
                    return { ...action, status: 'success', result: updated };
                case 'update_stock':
                    const product = await this.inventoryService.findByName(data.product, companyId);
                    if (!product)
                        return { ...action, status: 'error', message: `Producto "${data.product}" no encontrado.` };
                    let delta = data.quantity;
                    if (data.operation === 'remove')
                        delta = -delta;
                    if (data.operation === 'set') {
                        const updatedStock = await this.inventoryService.update(product.id, { stock: data.quantity }, companyId);
                        return { ...action, status: 'success', result: updatedStock };
                    }
                    else {
                        const updatedStock = await this.inventoryService.updateStock(product.id, delta, companyId);
                        return { ...action, status: 'success', result: updatedStock };
                    }
                case 'update_price':
                    const pToPrice = await this.inventoryService.findByName(data.product, companyId);
                    if (!pToPrice)
                        return { ...action, status: 'error', message: `Producto "${data.product}" no encontrado.` };
                    const updatedPrice = await this.inventoryService.update(pToPrice.id, { price: data.price, image: data.image }, companyId);
                    return { ...action, status: 'success', result: updatedPrice };
                case 'delete_product':
                    const pToDelete = await this.inventoryService.findByName(data.product, companyId);
                    if (!pToDelete)
                        return { ...action, status: 'error', message: `Producto "${data.product}" no encontrado.` };
                    await this.inventoryService.remove(pToDelete.id, companyId);
                    return { ...action, status: 'success', message: `Producto "${data.product}" eliminado.` };
                case 'create_category':
                    const newCat = await this.inventoryService.createCategory(data.name, companyId);
                    return { ...action, status: 'success', result: newCat, message: `Categoría "${data.name}" creada.` };
                case 'update_category':
                    const catToUpdate = await this.inventoryService.findCategoryByName(data.oldName, companyId);
                    if (!catToUpdate)
                        return { ...action, status: 'error', message: `Categoría "${data.oldName}" no encontrada.` };
                    const updatedCat = await this.inventoryService.updateCategory(catToUpdate.id, data.newName, companyId);
                    return { ...action, status: 'success', result: updatedCat, message: `Categoría actualizada a "${data.newName}".` };
                case 'delete_category':
                    const catToDelete = await this.inventoryService.findCategoryByName(data.name, companyId);
                    if (!catToDelete)
                        return { ...action, status: 'error', message: `Categoría "${data.name}" no encontrada.` };
                    await this.inventoryService.removeCategory(catToDelete.id, companyId);
                    return { ...action, status: 'success', message: `Categoría "${data.name}" eliminada.` };
                case 'bulk_update_products':
                    const updatedCount = await this.inventoryService.bulkUpdate(companyId, data);
                    return { ...action, status: 'success', message: `Se han actualizado ${updatedCount} productos correctamente.` };
                case 'search_products':
                    const pSearch = await this.inventoryService.findByName(data.query || data.product, companyId);
                    if (!pSearch)
                        return { ...action, status: 'error', message: `No he encontrado "${data.query || data.product}".` };
                    return { ...action, status: 'success', result: pSearch, message: `Hay ${pSearch.stock} unidades de "${pSearch.name}".` };
                case 'get_low_stock':
                    const allProducts = await this.inventoryService.findAll(companyId);
                    const threshold = data.threshold || 5;
                    const lowStock = allProducts.filter(p => p.stock <= (p.minStock || threshold));
                    const listNames = lowStock.map(p => `${p.name} (${p.stock})`).join(', ');
                    const msg = lowStock.length > 0
                        ? `He encontrado ${lowStock.length} productos con stock bajo: ${listNames}.`
                        : 'No hay productos con stock bajo.';
                    return { ...action, status: 'success', result: lowStock, message: msg };
                case 'chat_response':
                    return { ...action, status: 'success' };
                default:
                    return { ...action, status: 'error', message: 'Intención no reconocida.' };
            }
        }
        catch (e) {
            return { ...action, status: 'error', message: e.message };
        }
    }
    async generateStatsSummary(stats, companyId) {
        const systemPrompt = `
Eres el "BarFlow Business Analyst", un experto en inteligencia de negocio para hostelería.
Tu tarea es analizar los datos de ventas de un establecimiento y generar un resumen ejecutivo ultra-profesional, perspicaz y accionable.

REGLAS:
1. Sé conciso pero profundo.
2. Identifica tendencias (crecimiento, bajadas, picos).
3. Da consejos reales para mejorar el margen o la operativa.
4. Usa un tono motivador y experto.
5. Formatea la respuesta con negritas y puntos clave.
6. Responde en ESPAÑOL.
7. PROHIBIDO el uso de emojis. Mantén un tono ejecutivo limpio.

DATOS DISPONIBLES:
${JSON.stringify(stats, null, 2)}
`;
        try {
            const response = await axios_1.default.post(this.apiUrl, {
                model: 'openai/gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: "Genera el resumen ejecutivo del periodo actual." }
                ],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://barflow.app',
                    'X-Title': 'BarFlow AI'
                }
            });
            return { summary: response.data.choices[0].message.content };
        }
        catch (error) {
            this.logger.error('Error generating AI stats summary:', error.message);
            return { summary: "No se pudo generar el resumen de IA en este momento. Los datos base siguen siendo precisos." };
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService,
        smart_image_service_1.SmartImageService])
], AiService);
//# sourceMappingURL=ai.service.js.map