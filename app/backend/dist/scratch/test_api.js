"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function testApi() {
    try {
        console.log('Testing Login...');
        const loginRes = await fetch('http://127.0.0.1:3000/auth/login-saas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyCode: 'BCENTRAL',
                pin: '1111'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok)
            throw new Error(JSON.stringify(loginData));
        const token = loginData.access_token;
        console.log('Login successful, token received.');
        const headers = { Authorization: `Bearer ${token}` };
        console.log('Fetching Inventory...');
        const invRes = await fetch('http://127.0.0.1:3000/inventory', { headers });
        const invData = await invRes.json();
        console.log(`Found ${invData.length} products.`);
        console.log('Fetching Invoices...');
        const incRes = await fetch('http://127.0.0.1:3000/invoices', { headers });
        const incData = await incRes.json();
        console.log(`Found ${incData.length} invoices.`);
        console.log('All tests passed!');
    }
    catch (error) {
        console.error('Test failed:', error.message);
    }
}
testApi();
//# sourceMappingURL=test_api.js.map