import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import iconv from 'iconv-lite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, 'stocks.csv');
const OUTPUT_PATH = path.join(__dirname, 'stocks.json');

const stocks = [];

fs.createReadStream(CSV_PATH)
    .pipe(iconv.decodeStream('cp949'))
    .pipe(csv({
        strict: false,
        mapHeaders: ({ header }) =>
            header?.replace(/\ufeff/g, '').trim()
    }))
    .on('data', (row) => {
        if (!row['종목코드'] || !row['종목명']) return;

        stocks.push({
            code: row['종목코드'],
            name: row['종목명'],
            market: row['시장구분'],
            marketCap: Number(
                row['시가총액']?.replace(/,/g, '') || 0
            )
        });
    })
    .on('end', () => {
        fs.writeFileSync(
            OUTPUT_PATH,
            JSON.stringify(stocks, null, 2),
            'utf-8'
        );

        console.log(`✅ stocks2.json 생성 완료 (${stocks.length}개)`);
        console.log('📁 저장 위치:', OUTPUT_PATH);
    })
    .on('error', (err) => {
        console.error('CSV 파싱 오류:', err);
    });




