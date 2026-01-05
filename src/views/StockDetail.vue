<template>
    <h2 class="tit-24">종목 정보</h2>
    <table v-if="stockInfo" class="stock-table" style="margin:20px 0">
        <tbody>
            <tr>
                <th>종목명 (코드)</th>
                <td colspan="3">
                    <div>
                        <span><b class="txt-24">{{ stockInfo.name }} ({{ stockInfo.code }})</b></span>
                        <button class="btn-md btn-primary" @click="addFavorite">관심종목 추가</button>
                    </div>
                </td>
            </tr>
            <tr class="price-row">
                <th>현재가</th>
                <td :style="{
                    color: stockInfo.diff > 0 ? '#F40006' : stockInfo.diff < 0 ? '#42a5f5' : '#222',
                    'font-weight': 'bold'
                }"><b class="txt-16">{{ formatNumber(stockInfo.price) }}원</b></td>
                <th>전일대비</th>
                <td :style="{
                    color: stockInfo.diff > 0 ? '#F40006' : stockInfo.diff < 0 ? '#42a5f5' : '#222',
                    'font-weight': 'bold'
                }"><b class="txt-16">{{ stockInfo.diff > 0 ? '+' : '' }}{{ formatNumber(stockInfo.diff) }}원
                    ({{ stockInfo.diffRate > 0 ? '+' : '' }}{{ stockInfo.diffRate }}%)</b></td>

            </tr>
            <tr>
                <th>시장</th>
                <td><b>{{ formatMarket(stockInfo.market) }}</b></td>
                <th>거래량</th>
                <td><b class="txt-16">{{ formatNumber(stockInfo.volume) }}</b></td>
            </tr>


            <tr>

                <th>PER</th>
                <td>{{ stockInfo.per }}</td>
                <th>PBR</th>
                <td>{{ stockInfo.pbr }}</td>
            </tr>

            <tr>


                <th>시가총액</th>
                <td>{{ formatNumber(stockInfo.marketCap) }}<span class="unit">(백만)</span></td>
                <th>시가</th>
                <td>{{ formatNumber(stockInfo.open) }}</td>
            </tr>

            <tr>
                <th>고가</th>
                <td>{{ formatNumber(stockInfo.high) }}</td>
                <th>저가</th>
                <td>{{ formatNumber(stockInfo.low) }}</td>

            </tr>

            <tr>

                <th>상한가</th>
                <td>{{ formatNumber(stockInfo.upper) }}</td>
                <th>하한가</th>
                <td>{{ formatNumber(stockInfo.lower) }}</td>
            </tr>

            <tr>


                <th>52주 최고</th>
                <td>{{ formatNumber(stockInfo.high52w) }}</td>
                <th>52주 최저</th>
                <td>{{ formatNumber(stockInfo.low52w) }}</td>
            </tr>

            <tr>
                <th>업종</th>
                <td>{{ stockInfo.sector }}</td>

                <th></th>
                <td></td>
            </tr>

            <tr class="rank-row">
                <th>시총 순위</th>
                <td colspan="3">{{ stockInfo.marketRankMarket === 'KOSPI' ? '코스피' : '코스닥' }}
            {{ stockInfo.marketCapRank }}위</td>
            </tr>
        </tbody>
    </table>
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
            const res = await axios.get(`/api/stocks/${code}`);
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
        },

        // 관심종목 추가
        addFavorite() {
            if (!this.stockInfo) return;

            // 로컬스토리지에서 기존 데이터 가져오기
            let favorites = JSON.parse(localStorage.getItem('favoriteStocks')) || [];

            // 이미 있는지 확인
            const exists = favorites.some(item => item.code === this.stockInfo.code);
            if (exists) {
                alert('이미 관심 종목에 추가된 종목입니다.');
                return;
            }

            const newFavorite = this.stockInfo;
            // const newFavorite = JSON.parse(JSON.stringify(this.stockInfo));

            favorites.push(newFavorite);
            localStorage.setItem('favoriteStocks', JSON.stringify(favorites));

            alert('관심 종목에 추가되었습니다!');
        }
    }
};
</script>
