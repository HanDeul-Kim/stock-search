<template>
    <header>
        <nav>
            <div class="gnb">
                <li>
                    <a href="">Home</a>
                </li>
            </div>
            <SearchBar />
        </nav>
    </header>
    <div>
        <input v-model="searchQuery" @input="search" @keyup.enter="fetchStock" placeholder="종목명 입력"
            style="padding: 10px; width: 250px;" />
        <ul v-if="suggestions.length">
            <li v-for="item in suggestions" :key="item.code" @click="selectStock(item)" class="search-list">
                {{ item.name }} ({{ item.code }}) - {{ item.market }}
            </li>
        </ul>

        <div v-if="stockInfo" style="margin-top:20px;">
            <h2>{{ stockInfo.name }} ({{ stockInfo.code }})</h2>
            <p>시장: {{ stockInfo.market }}</p>
            <p>현재가: {{ stockInfo.price }}원 / PER: {{ stockInfo.per }} / PBR: {{ stockInfo.pbr }}</p>
        </div>
    </div>
</template>

<script>
import SearchBar from './SearchBar.vue';
import axios from 'axios';
export default {
    name: 'Header',
    data() {
        return {
            searchQuery: '',
            suggestions: [],
            stockInfo: null
        };
    },
    components: {
        SearchBar
    },
    methods: {
        async search(event) {
            try {
                const q = event.target.value;
                const res = await axios.get(`http://localhost:3000/api/stocks?q=${q}`);
                this.suggestions = res.data; // 자동완성 정보
            } catch (err) {
                console.error(err);
            }
        },
        async selectStock(item) {
            try {
                const res = await axios.get(`http://localhost:3000/api/stocks/${item.code}`);
                this.stockInfo = res.data;      // 상세 정보 업데이트
                this.searchQuery = item.name;   // 검색창 이름 채우기
                this.suggestions = [];          // 자동완성 닫기
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
        }
    }
}
</script>
<style></style>
