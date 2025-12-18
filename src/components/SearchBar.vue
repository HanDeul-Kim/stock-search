<template>
    <ul class="stock-search" ref="searchContainer">
        <li>
            <div class="stock-search-inner">
                <input v-model="searchQuery" @input="handleInput" @focus="isSuggestionsVisible = true"
                    @keyup.enter="fetchStock" placeholder="종목명 입력" class="input-md" />

                <div v-if="suggestions.length && isSuggestionsVisible" class="search-auto">
                    <ul>
                        <li v-for="item in suggestions" :key="item.code" @click="selectStock(item)" class="search-list">
                            {{ item.code }} {{ item.name }} {{ formatMarket(item.market) }}
                        </li>
                    </ul>
                </div>
            </div>

            <div v-if="stockInfo" style="margin-top:20px;">
                <h2>{{ stockInfo.name }} ({{ stockInfo.code }})</h2>
                <p>시장: {{ formatMarket(stockInfo.market) }}</p>
                <p>현재가: {{ formatNumber(stockInfo.price) }}원 / PER: {{ stockInfo.per }} / PBR: {{ stockInfo.pbr }}</p>
                <p :style="{ color: stockInfo.diff > 0 ? '#F40006' : stockInfo.diff < 0 ? '#005FE0' : '#222', 'font-weight': 'bold'}">
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
            </div>
        </li>
        <li>
            <a href="">내 관심종목</a>
        </li>
    </ul>
</template>

<script>
import axios from 'axios';

export default {
    name: 'SearchBar',
    data() {
        return {
            searchQuery: '',
            suggestions: [],
            stockInfo: null,
            // 자동완성 창의 표시 여부를 제어하는 상태값
            isSuggestionsVisible: false
        };
    },
    mounted() {
        // 컴포넌트가 마운트될 때 전역 클릭 이벤트 리스너 등록
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        // 컴포넌트가 제거될 때 리스너 제거
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        async search(q) {
            if (!q) {
                this.suggestions = [];
                return;
            }
            try {
                const res = await axios.get(`http://localhost:3000/api/stocks?q=${q}`);
                this.suggestions = res.data;
                this.isSuggestionsVisible = true; // 검색 결과가 오면 창을 띄움
            } catch (err) {
                console.error(err);
            }
        },
        formatMarket(market) {
            if (market === 'KOSDAQ GLOBAL') return 'KOSDAQ';
            return market;
        },
        handleInput(event) {
            const q = event.target.value;
            this.search(q);
        },
        // 외부클릭 감지
        handleClickOutside(event) {
            // 클릭된 요소가 검색창 컨테이너(ref="searchContainer") 내부에 포함되어 있지 않다면
            if (this.$refs.searchContainer && !this.$refs.searchContainer.contains(event.target)) {
                this.isSuggestionsVisible = false;
            }
        },
        async selectStock(item) {
            try {
                const res = await axios.get(`http://localhost:3000/api/stocks/${item.code}`);
                this.stockInfo = res.data;
                this.searchQuery = item.name;
                this.isSuggestionsVisible = false; // 선택 후 닫기
            } catch (err) {
                console.error(err);
            }
        },
        fetchStock() {
            const queryLower = this.searchQuery.toLowerCase();
            const item = this.suggestions.find(
                s => s.name.toLowerCase() === queryLower || s.code === this.searchQuery
            );
            if (item) {
                this.selectStock(item);
            }
        },
        formatNumber(value) {
            if (!value) return '-';
            return Number(value).toLocaleString();
        },
    }
}
</script>