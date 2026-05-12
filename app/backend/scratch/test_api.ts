import axios from 'axios';

async function test() {
    try {
        const res = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=mojito');
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}
test();
