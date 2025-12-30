<template>
    <div style="padding: 20px;">
        <h2>나의 관심 종목</h2>
        <div v-if="favoriteStocks.length > 0">
            <div v-for="(stock, idx) in favoriteStocks" :key="stock.code"
                style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                <h3>{{ stock.name }} <span style="font-size: 0.8em; color: gray;">({{ stock.code }})</span></h3>
                <p>현재가: {{ formatNumber(stock.price) }}원</p>
                <p>PER: {{ stock.per }}</p>
                <button @click="removeFavorite(idx)"
                    style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">삭제</button>
                <p>52주 최고가 : {{ stock.high52w }}</p>
                <p>52주 최저가 : {{ stock.low52w }}</p>
                <p>상한가 : {{ stock.upper }}원</p>
                <p>하한가 : {{ stock.lower }}원</p>
            </div>
        </div>
        <div v-else>
            <p>추가 한 관심 종목이 없습니다.</p>
        </div>
    </div>
</template>

<script>import axios from 'axios';

export default {
    name: 'Mypage',
    data() {
        return {
            favoriteStocks: []
        };
    },
    mounted() {
        this.getFavoriteStocks();
    },
    methods: {
        async getFavoriteStocks() {
            const sent = JSON.parse(localStorage.getItem('favoriteStocks')) || [];
            if (sent.length === 0) {
                this.favoriteStocks = [];
                return;
            }

            try {
                // 저장된 종목들의 최신 데이터 가져오기
                const promises = sent.map(item => axios.get(`http://localhost:3000/api/stocks/${item.code}`));
                const responses = await Promise.all(promises);
                this.favoriteStocks = responses.map((res, idx) => ({
                    ...sent[idx],     // 기존 데이터
                    ...res.data       // 새로 추가한 데이터 
                }));
                

            } catch (error) {
                console.error("최신 데이터 불러오기 실패:", error);
                // 에러 발생 시 기존 로컬스토리지 데이터 사용
                this.favoriteStocks = sent;
            }
        },
        formatNumber(value) {
            if (!value) return '-';
            return Number(value).toLocaleString();
        },
        removeFavorite(idx) {
            this.favoriteStocks.splice(idx, 1);
            localStorage.setItem('favoriteStocks', JSON.stringify(this.favoriteStocks));
        }
    }
}
</script>
<style></style>
