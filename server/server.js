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
// 내 json 데이터들 여기에 담아
let stocks = [];

if (fs.existsSync(DATA_PATH)) {
    stocks = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    console.log(`${stocks.length}개 종목 로드 성공`);
}
// 한국투자증권 open api 기본 주소
const API_BASE = "https://openapi.koreainvestment.com:9443";
const APP_KEY = process.env.API_KEY;
const APP_SECRET = process.env.API_SECRET;

// 발급받은 토큰 저장해두려고 만든 변수
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
// 시총 억단위가 기본인데 백만단위로 변경
function convertEokToMillion(value) {
    if (!value) return null;
    return Number(value) * 100;
}
// 시가총액 순위 코스피 코스닥 나누기
function normalizeMarket(market) {
    // 코스닥 + 코스닥 글로벌을 하나로
    if (market === 'KOSDAQ' || market === 'KOSDAQ GLOBAL') {
        return 'KOSDAQ';
    }
    return market; // KOSPI
}
// 개별종목시세 APi (quotations/inquire-price)
async function fetchRealStockData(code) {
    try {
        const token = await getAccessToken();
        if (!token) return null;

        // 한국투자증권 시세 api 호출 (inquire-price가 기본임)
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
                    FID_INPUT_ISCD: code         // 종목코드
                }
            }
        );

        const out = res.data.output;        // res.data.output.stck_prpr 가독성 위해서

        // 프론트로 뿌려줄 데이터들
        return {
            price: out.stck_prpr,           // 가격
            per: out.per,                   // per
            pbr: out.pbr,                   // pbr
            volume: out.acml_vol,           // 거래량,
            diff: out.prdy_vrss,            // 전일대비 가격
            diffRate: out.prdy_ctrt,        // 전일대비 %
            open: out.stck_oprc,            // 시가
            high: out.stck_hgpr,            // 고가
            low: out.stck_lwpr,             // 저가
            upper: out.stck_mxpr,           // 상한가
            lower: out.stck_llam,           // 하한가
            tradeAmount: out.acml_tr_pbmn,  // 거래대금
            high52w: out.d250_hgpr,         // 52주 최고
            low52w: out.d250_lwpr,          // 52주 최저
            sector: out.bstp_kor_isnm,      // 업종
            marketCap: convertEokToMillion(out.hts_avls)   // 기존 억단위 인데, 백만으로 바꾼거
        };
    } catch (err) {
        console.error("종목 데이터 조회 실패:", err.response?.data || err.message);
        return null;
    }
}
// 자동완성 종목 검색
app.get('/api/stocks', (req, res) => {
    const q = req.query.q ?? "";
    const keyword = q.trim().toLowerCase();
    // json 데이터에서 일치하는거 검색
    const result = stocks.filter(
        s => s.name.toLowerCase().includes(keyword) || s.code === keyword
    );
    // 최대 20개 반환
    res.json(result.slice(0, 20));
});

// 검색한 종목 상세조회 api (개별종목시세)
app.get('/api/stocks/:code', async (req, res) => {
    const code = req.params.code; // api/stocks/12345
    // json 데이터에서 일치하는거 검색
    const stock = stocks.find(s => s.code === code);
    if (!stock) return res.status(404).json({ error: "Not found" });

    // 한국투자증권 api에서 가져온 실시간 데이터
    const realData = await fetchRealStockData(code);

    // 코스닥 코스피 총합에서 시총순위 구하지 않고 구분해서 시총순위 구하는 코드
    const normalizedMarket = normalizeMarket(stock.market);
    const marketStocks = stocks
        .filter(
            s =>
                normalizeMarket(s.market) === normalizedMarket &&
                typeof s.marketCap === 'number'
        )
        .sort((a, b) => b.marketCap - a.marketCap);
    const rankIndex = marketStocks.findIndex(s => s.code === code);
    const rank = rankIndex >= 0 ? rankIndex + 1 : null;

    // json + api 데이터 합쳐서 vue로 응답해줌
    res.json({
        ...stock,                               // stocks.json에서 가져온 데이터
        ...(realData ?? {}),                    // 한국투자증권 api 실시간 데이터
        marketCapRank: rank,                    // 시총순위
        marketRankMarket: normalizedMarket      // 코스피 코스닥 구분
    });
});

// 공공데이터포털
app.get('/api/market-indices', async (req, res) => {
    try {
        const SERVICE_KEY = decodeURIComponent(process.env.PUBLIC_API_KEY);
        const url = 'https://apis.data.go.kr/1160100/service/GetMarketIndexInfoService/getStockMarketIndex';

        const [kospiRes, kosdaqRes] = await Promise.all([
            axios.get(url, {
                params: { serviceKey: SERVICE_KEY, resultType: 'json', numOfRows: 5, pageNo: 1, idxNm: '코스피' }
            }),
            axios.get(url, {
                params: { serviceKey: SERVICE_KEY, resultType: 'json', numOfRows: 5, pageNo: 1, idxNm: '코스닥' }
            })
        ]);

        const result = {
            kospi: kospiRes.data.response.body.items.item[0],
            kosdaq: kosdaqRes.data.response.body.items.item[0]
        };

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('데이터를 가져오지 못했습니다.');
    }
});

// 환율 (네이버 실시간 데이터 가져옴)
app.get('/api/exchange/usdkrw-naver', async (req, res) => {
    try {
        const response = await axios.get(
            'https://m.search.naver.com/p/csearch/content/qapirender.nhn',
            {
                params: {
                    key: 'calculator',
                    pkid: 141,
                    q: '환율',
                    where: 'm',
                    u1: 'keb',
                    u6: 'standardUnit',
                    u7: 0,
                    u3: 'USD',
                    u4: 'KRW',
                    u8: 'down',
                    u2: 1
                },
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
                    'Referer': 'https://m.search.naver.com/'
                }
            }
        );

        const country = response.data.country;

        const usd = country.find(v => v.currencyUnit === '달러');
        const krw = country.find(v => v.currencyUnit === '원');

        res.json({
            base: usd.subValue,
            rate: Number(krw.value.replace(/,/g, '')), // 1444.10
            raw: response.data 
        });
    } catch (e) {
        console.error('NAVER 환율 에러', e.message);
        res.status(500).json({ error: 'NAVER_EXCHANGE_FAIL' });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});