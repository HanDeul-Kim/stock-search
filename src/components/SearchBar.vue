<template>
    <ul class="stock-search" ref="searchContainer">
        <li>
            <div class="stock-search-inner">
                <input v-model="searchQuery" @input="handleInput" @focus="isSuggestionsVisible = true"
                    @keyup.enter="fetchStock" placeholder="종목명 입력" class="input-md" />

                <div v-if="suggestions.length && isSuggestionsVisible" class="search-auto">
                    <ul>
                        <!-- 이벤트 버블링때문에 @click.stop으로 변경했음. -->
                        <li v-for="(item, idx) in suggestions" :key="item.code" :idx="idx"
                            @click.stop="selectStock(item)" class="search-list">
                            {{ item.code }} {{ item.name }} {{ formatMarket(item.market) }}
                        </li>
                    </ul>
                </div>
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
            // input 입력값
            searchQuery: '',
            // 자동완성 목록
            suggestions: [],
            // 검색한 종목 상세 정보
            stockInfo: null,
            // 자동완성 표시여부
            isSuggestionsVisible: false
        };
    },
    mounted() {
        // 화면 클릭 감지 이벤트 (검색창에서 빈공간 누르면 사라지게 하려고)
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        // 이벤트 해제
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
        // 코스닥 global이라고 나오는얘들은 그냥 코스닥으로 나오게끔
        formatMarket(market) {
            if (market === 'KOSDAQ GLOBAL') return 'KOSDAQ';
            return market;
        },
        // 입력 이벤트 처리
        handleInput(event) {
            const q = event.target.value;
            this.search(q);
        },
        // 빈공간 클릭 할 때 자동완성창 닫는 함수
        handleClickOutside(event) {
            if (this.$refs.searchContainer && !this.$refs.searchContainer.contains(event.target)) {
                this.isSuggestionsVisible = false;
            }
        },

        // 종목 클릭 시 상세 정보 요청
        async selectStock(item) {
            try {
                // 🔹 기존 동작 유지
                const res = await axios.get(`http://localhost:3000/api/stocks/${item.code}`);
                this.stockInfo = res.data;
                this.searchQuery = item.name;
                this.isSuggestionsVisible = false;

                // 🔥 추가: 상세 페이지로 이동
                this.$router.push(`/detail/${item.code}`);
            } catch (err) {
                console.error(err);
            }
        },

        // 엔터로도 종목 서치 가능하게
        fetchStock() {
            const queryLower = this.searchQuery.toLowerCase();
            const item = this.suggestions.find(
                s => s.name.toLowerCase() === queryLower || s.code === this.searchQuery
            );
            if (item) {
                this.selectStock(item);
            }
        },
        fetchStock() {
            if (!this.suggestions.length) return;

            const queryLower = this.searchQuery.toLowerCase();

            // 일치하는 종목 먼저 찾기
            let item = this.suggestions.find(
                s => s.name.toLowerCase() === queryLower || s.code === this.searchQuery
            );

            if (!item) {
                item = this.suggestions[0];
            } 
            if (item) {
                this.selectStock(item);
            }
        },
        // 숫자 콤마 표기
        formatNumber(value) {
            if (!value) return '-';
            return Number(value).toLocaleString();
        },
    }
};
</script>