<template>
    <div class="market-container">
        <article class="dashboard-item">
            <h2 class="tit-24">시장 지수 정보</h2>

            <div v-if="loading" class="loading-box">
                로딩중...
            </div>

            <div v-else class="market-item-wrap">
                <div v-if="indices.kospi" class="market-item">
                    <h3>{{ indices.kospi.idxNm }}</h3>
                    <!-- 지수 실시간 제공 api는 유료임 -->
                    <p class="date">{{ formatDate(indices.kospi.basDt) }} 기준</p>
                    <span class="price">{{ indices.kospi.clpr }}</span>
                    <b :class="getColorClass(indices.kospi.vs)">
                        {{ getSign(indices.kospi.vs) }} {{ indices.kospi.vs }} ({{
                            Number(indices.kospi.fltRt).toFixed(2)
                        }}%)
                    </b>
                </div>

                <div v-if="indices.kosdaq" class="market-item">
                    <h3>{{ indices.kosdaq.idxNm }}</h3>
                    <p class="date">{{ formatDate(indices.kosdaq.basDt) }} 기준</p>
                    <span class="price">{{ indices.kosdaq.clpr }}</span>
                    <b :class="getColorClass(indices.kosdaq.vs)">
                        {{ getSign(indices.kosdaq.vs) }} {{ indices.kosdaq.vs }} ({{
                            Number(indices.kosdaq.fltRt).toFixed(2)
                        }}%)
                    </b>
                </div>

                <div v-if="!indices.kospi && !indices.kosdaq" class="error-box">
                    데이터를 불러올 수 없습니다. 서버 상태를 확인하세요.
                </div>
            </div>
        </article>
        <article class="dashboard-item">
            <h2 class="tit-24">환율</h2>
            <div v-if="usdkrw" class="market-item">
                <h3>원/달러 환율 (USD)</h3>
                <p class="date">{{ formatDate(usdkrw.date) }} 실시간</p>
                <span class="price">
                    {{ usdkrw.rate.toLocaleString() }}
                </span>
            </div>
        </article>
    </div>






</template>

<script>
import axios from 'axios';
export default {
    name: 'Home',
    data() {
        return {
            indices: {
                kospi: null,
                kosdaq: null
            },
            usdkrw: null,
            loading: true
        };
    },
    methods: {
        // 날짜 포맷
        formatDate(dateStr) {
            if (!dateStr) return '';
            return dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        },
        // 상승/하락 기호
        getSign(vs) {
            return parseFloat(vs) > 0 ? '▲' : '▼';
        },
        // 상승 하락 색깔 클래스바인딩
        getColorClass(vs) {
            return parseFloat(vs) > 0 ? 'red' : 'blue';
        },
        // 데이터 가져오기
        async fetchMarketData() {
            try {
                const response = await axios.get('http://localhost:3000/api/market-indices');
                this.indices = response.data;
            } catch (error) {
                console.error("데이터 호출 에러:", error);
            } finally {
                this.loading = false;
            }
        },
        // 
        async fetchUsdKrwRealtime() {
            try {
                const res = await axios.get(
                    'http://localhost:3000/api/exchange/usdkrw-naver'
                );
                this.usdkrw = {
                    rate: res.data.rate,
                    date: new Date().toISOString().slice(0, 10).replace(/-/g, '')
                };
            } catch (e) {
                console.error('실시간 환율 실패', e);
            }
        },
    },
    mounted() {
        // 공공데이터포털 (지수)
        this.fetchMarketData();
        // 환율
        this.fetchMarketData();
        this.fetchUsdKrwRealtime();

    }



}
</script>
<style></style>
