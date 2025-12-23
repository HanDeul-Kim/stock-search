<template>
    <div v-if="stockInfo" style="margin-top:20px;">
        <h2>{{ stockInfo.name }} ({{ stockInfo.code }})</h2>
        <p>시장: {{ formatMarket(stockInfo.market) }}</p>
        <p>
            현재가: {{ formatNumber(stockInfo.price) }}원 /
            PER: {{ stockInfo.per }} /
            PBR: {{ stockInfo.pbr }}
        </p>
        <p
            :style="{
                color: stockInfo.diff > 0 ? '#F40006' : stockInfo.diff < 0 ? '#005FE0' : '#222',
                'font-weight': 'bold'
            }"
        >
            전일대비:
            {{ stockInfo.diff > 0 ? '+' : '' }}{{ formatNumber(stockInfo.diff) }}원
            ({{ stockInfo.diffRate > 0 ? '+' : '' }}{{ stockInfo.diffRate }}%)
        </p>
        <p>거래량: {{ formatNumber(stockInfo.volume) }}</p>
        <p>
            시가: {{ formatNumber(stockInfo.open) }} /
            고가: {{ formatNumber(stockInfo.high) }} /
            저가: {{ formatNumber(stockInfo.low) }}
        </p>
        <p>
            상한가: {{ formatNumber(stockInfo.upper) }} /
            하한가: {{ formatNumber(stockInfo.lower) }}
        </p>
        <p>52주 최고가 : {{ formatNumber(stockInfo.high52w) }}</p>
        <p>52주 최저가 : {{ formatNumber(stockInfo.low52w) }}</p>
        <p>업종 : {{ stockInfo.sector }}</p>
        <p>시가총액 : {{ formatNumber(stockInfo.marketCap) }} (단위: 백만)</p>
        <p>
            시가총액 순위 :
            {{ stockInfo.marketRankMarket === 'KOSPI' ? '코스피' : '코스닥' }}
            {{ stockInfo.marketCapRank }}위
        </p>

        <button class="btn-md btn-primary">관심 종목으로 추가~!</button>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'StockDetail',
    data() {
        return {
            stockInfo: null
        };
    },
    async mounted() {
        const code = this.$route.params.code;
        await this.fetchStockDetail(code);
    },
    watch: {
        // url 바뀌면 새로바뀐 /:code값으로 함수 다시 실행
        '$route.params.code'(newCode) {
            this.fetchStockDetail(newCode); 
        }
    },
    methods: {
        async fetchStockDetail(code) {
            const res = await axios.get(`http://localhost:3000/api/stocks/${code}`);
            this.stockInfo = res.data;
        },
        // 숫자 콤마 표기
        formatNumber(value) {
            if (!value) return '-';
            return Number(value).toLocaleString();
        },
        // 코스닥 글로벌도 코스닥으로 통합
        formatMarket(market) {
            if (market === 'KOSDAQ GLOBAL') return 'KOSDAQ';
            return market;
        }
        // 관심종목 추가

    }
};
</script>
