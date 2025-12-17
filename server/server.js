import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
const PORT = 3000;

const DATA_PATH = path.join(__dirname, 'stocks.json');
console.log(DATA_PATH);

let stocks = [];
if (fs.existsSync(DATA_PATH)) {
    stocks = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    console.log(`📦 ${stocks.length}개 종목 로딩`);
}

app.get('/api/stocks', (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);

    const keyword = q.trim().toLowerCase(); // 소문자로 변환

    const result = stocks.filter(
        s => s.name.toLowerCase().includes(keyword) || s.code === keyword
    );

    res.json(result.slice(0, 20)); // 최대 20개 반환
});
app.get('/api/stocks/:code', (req, res) => {
    const code = req.params.code;
    const stock = stocks.find(s => s.code === code);

    if (!stock) return res.status(404).json({ error: 'Not found' });

    // 종목에 대한 시세,per 등등
    const detailedStock = {
        ...stock,
        price: stock.price || 74000,
        per: stock.per || 15.2,
        pbr: stock.pbr || 1.4
    };

    res.json(detailedStock);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});