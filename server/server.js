import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
const PORT = 3000;

const DATA_PATH = path.join(__dirname, 'stocks.json');
let stocks = [];

if (fs.existsSync(DATA_PATH)) {
    stocks = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    console.log(`📦 ${stocks.length} stocks loaded`);
}

const API_BASE = "https://openapi.koreainvestment.com:9443";
const APP_KEY = process.env.API_KEY;
const APP_SECRET = process.env.API_SECRET;

let accessToken = null;
// 토큰접근
async function getAccessToken() {
    if (accessToken) return accessToken;
    try {
        const res = await axios.post(`${API_BASE}/oauth2/token`, null, {
            params: {
                grant_type: "client_credentials",
                appkey: APP_KEY,
                appsecret: APP_SECRET
            }
        });
        accessToken = res.data.access_token;
        console.log("토큰 발급 성공");
        return accessToken;
    } catch (err) {
        console.error("토큰 발급 실패:", err.response?.data || err.message);
        return null;
    }
}
// 시총 백만단위로 변경
function convertEokToMillion(value) {
    if (!value) return null;
    return Number(value) * 100;
}
// 한국투자증권 api (기본시세)
async function fetchRealStockData(code) {
    try {
        const token = await getAccessToken();
        if (!token) return null;

        const res = await axios.get(
            `${API_BASE}/uapi/domestic-stock/v1/quotations/inquire-price`,
            {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `Bearer ${token}`,
                    "appkey": APP_KEY,
                    "appsecret": APP_SECRET,
                    "tr_id": "FHKST01010100",
                    "custtype": "P"   // 개인고객
                },
                params: {
                    FID_COND_MRKT_DIV_CODE: "J", // KRX임. nxt도 하고싶은데 나중에
                    FID_INPUT_ISCD: code          // 종목코드
                }
            }
        );

        const out = res.data.output; // 배열 접근 제거

        return {
            price: out.stck_prpr,           // 가격
            per: out.per,                   // per
            pbr: out.pbr,                   // pbr
            volume: out.acml_vol,            // 거래량,
            diff: out.prdy_vrss,            // 전일대비 가격
            diffRate: out.prdy_ctrt,        // 전일대비 %
            open: out.stck_oprc,            // 시가
            high: out.stck_hgpr,            // 고가
            low: out.stck_lwpr,             // 저가
            upper: out.stck_mxpr,           // 상한가
            lower: out.stck_llam,           // 하한가
            tradeAmount: out.acml_tr_pbmn,  // 거래대금
            high52w: out.d250_hgpr,         // 52주 최고
            low52w: out.d250_lwpr,           // 52주 최저
            sector: out.bstp_kor_isnm,      // 업종
            marketCap: convertEokToMillion(out.hts_avls)        // 기존 억단위 인데, 백만으로 바꾼거
        };
    } catch (err) {
        console.error("종목 데이터 조회 실패:", err.response?.data || err.message);
        return null;
    }
}

app.get('/api/stocks', (req, res) => {
    const q = req.query.q ?? "";
    const keyword = q.trim().toLowerCase();
    const result = stocks.filter(
        s => s.name.toLowerCase().includes(keyword) || s.code === keyword
    );
    res.json(result.slice(0, 20));
});

app.get('/api/stocks/:code', async (req, res) => {
    const code = req.params.code;
    const stock = stocks.find(s => s.code === code);
    if (!stock) return res.status(404).json({ error: "Not found" });

    const realData = await fetchRealStockData(code);

    res.json({
        ...stock,
        ...(realData ?? {})
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});