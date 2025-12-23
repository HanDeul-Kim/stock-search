<template>
    <ul class="stock-search" ref="searchContainer">
        <li>
            <div class="stock-search-inner">
                <input :value="searchQuery" @input="handleInput" @focus="isSuggestionsVisible = true"
                    @keyup.enter="fetchStock" @keydown.down.prevent="moveDown" @keydown.up.prevent="moveUp"
                    placeholder="종목명이나 종목코드를 입력해주세요." class="input-md" />

                <div v-if="suggestions.length && isSuggestionsVisible" class="search-auto">
                    <ul>
                        <!-- 이벤트 버블링때문인지는 모르겠지만 @mousedown으로 변경했음. -->
                        <li v-for="(item, idx) in suggestions" :key="item.code" :idx="idx"
                            @mousedown="selectStock(item)" class="search-list"
                            :class="{ active: idx === selectKeybord }">
                            {{ item.code }} {{ item.name }} {{ formatMarket(item.market) }}
                        </li>
                    </ul>
                </div>
            </div>
        </li>
        <li>
            <router-link to="/mypage">내 관심종목</router-link>
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
            isSuggestionsVisible: false,
            // 키보드 선택 인덱스
            selectKeybord: -1
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
                this.selectKeybord = -1;
                return;
            }
            try {
                const res = await axios.get(`http://localhost:3000/api/stocks?q=${q}`);
                this.suggestions = res.data;
                this.isSuggestionsVisible = true;   // 자동완성창 다시 열기

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
            // v-model 대신 :value 사용으로 바꿨음 그래서 수동으로 값 업데이트 해줘야함. (v-model은 인풋값 받을때 input창 한번 눌러야 바뀌는 이슈가 있어서..)
            this.searchQuery = event.target.value;
            const q = this.searchQuery;
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
                const res = await axios.get(`http://localhost:3000/api/stocks/${item.code}`);
                this.stockInfo = res.data;
                this.searchQuery = item.name;
                this.isSuggestionsVisible = false;

                // 상세 페이지로 이동
                this.$router.push(`/detail/${item.code}`);
            } catch (err) {
                console.error(err);
            }
        },

        // 엔터로도 종목 서치 가능하게
        fetchStock() {
            if (!this.suggestions.length) return;

            let item = null;

            if (this.selectKeybord >= 0 && this.selectKeybord < this.suggestions.length) {
                item = this.suggestions[this.selectKeybord];
            } else {
                item = this.suggestions[0];
            }

            if (item) {
                this.selectStock(item);
                this.selectKeybord = -1;
            }
        },
        // 자동완성 키보드 이벤트
        moveDown() {
            if (!this.suggestions.length) return;

            // 현재 아무것도 선택되지 않은 상태면 첫 번째 항목 선택
    if (this.selectKeybord === -1) {
        this.selectKeybord = 0;
    } 
    // 마지막 항목이 아니면 아래로 이동
    else if (this.selectKeybord < this.suggestions.length - 1) {
        this.selectKeybord = this.selectKeybord + 1;
    }
        },
        moveUp() {
            if (!this.suggestions.length) return;

            if (this.selectKeybord > 0) {
                this.selectKeybord--;
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