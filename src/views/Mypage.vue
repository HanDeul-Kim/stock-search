<template>
    <h2 class="tit-24">나의 관심 종목</h2>

    <!-- 정렬 버튼 -->
    <!-- <div class="sort-btns">
        <button :class="{ active: sortType === 'recent' }" @click="sortType = 'recent'">추가순</button>
        <button :class="{ active: sortType === 'name' }" @click="sortType = 'name'">이름순</button>
        <button :class="{ active: sortType === 'diffRate' }" @click="sortType = 'diffRate'">등락률순</button>
    </div> -->

    <div class="sort-btns">
        <!-- 현재 상태 -->
        <div>
            <div class="btn-wrap" @click="isOpen = !isOpen">
                <button >
                    {{ currentLabel }}
                    
                </button>
                <img src="../../public/img/ico_arrow_down_white.png" alt="">
            </div>
            <ul class="dropdown" v-show="isOpen">
                <li class="select" v-for="opt in options" :key="opt.value" @click="selectOption(opt)"
                    :class="{ active: sortType === opt.value }">
                    {{ opt.label }}
                </li>
            </ul>
        </div>
        
    </div>

    <div v-if="favoriteStocks.length > 0" class="my-page-list">
        <ul>
            <li v-for="(stock, idx) in sortedStocks" :key="stock.code">
                <div class="name-box">
                    <router-link :to="`/detail/${stock.code}`">{{ stock.name }} ({{ stock.code }})</router-link>
                    <p>{{ formatMarket(stock.market) }}</p>
                </div>
                <div class="detail-box">
                    <div class="price-box">
                        <b :style="{
                            color: stock.diff > 0 ? '#F40006' : stock.diff < 0 ? '#42a5f5' : '#222',
                            'font-weight': 'bold'
                        }">{{ formatNumber(stock.price) }}</b>
                        <p>{{ formatNumber(stock.volume) }}주</p>
                    </div>
                    <div class="up-and-high">
                        <p :style="{
                            color: stock.diff > 0 ? '#F40006' : stock.diff < 0 ? '#42a5f5' : '#222',
                            'font-weight': 'bold'
                        }">
                            {{ stock.diff > 0 ? '+' : '' }}{{ formatNumber(stock.diff) }}<br>
                        </p>
                        <p :style="{
                            color: stock.diff > 0 ? '#F40006' : stock.diff < 0 ? '#42a5f5' : '#222',
                            'font-weight': 'bold'
                        }">
                            {{ stock.diffRate > 0 ? '+' : '' }}{{ stock.diffRate }}%
                        </p>

                    </div>
                    <div class="list-remove">
                        <i @click="removeFavorite(stock.code)"></i>
                    </div>
                </div>

            </li>
        </ul>
    </div>
    <div v-else>
        <p>추가 한 관심 종목이 없습니다.</p>
    </div>

</template>

<script>import axios from 'axios';

export default {
    name: 'Mypage',
    data() {
        return {
            favoriteStocks: [],
            // 정렬
            sortType: 'recent',   // 기본 정렬 최신 추가순으로
            isOpen: false,
            options: [
                { value: 'recent', label: '추가순' },
                { value: 'name', label: '이름순' },
                { value: 'diffRate', label: '등락률순' }
            ]
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
        formatMarket(market) {
            if (market === 'KOSDAQ GLOBAL') return 'KOSDAQ';
            return market;
        },
        removeFavorite(code) {
            // sort 구현 안했을때 코드
            // this.favoriteStocks.splice(idx, 1);
            // localStorage.setItem('favoriteStocks', JSON.stringify(this.favoriteStocks));

            this.favoriteStocks = this.favoriteStocks.filter(
                stock => stock.code !== code
            );

            localStorage.setItem(
                'favoriteStocks',
                JSON.stringify(this.favoriteStocks)
            );
        },
        selectOption(opt) {
            this.sortType = opt.value; // 정렬 상태 변경
            this.isOpen = false;       // 닫기
        }
    },
    computed: {
        sortedStocks() {
            const list = [...this.favoriteStocks];

            switch (this.sortType) {
                // 최근 추가한 순
                case 'recent':
                    return list;
                // 이름순
                case 'name':
                    return list.sort((a, b) =>
                        a.name.localeCompare(b.name, 'ko')
                    );
                // 등락률순
                case 'diffRate':
                    return list.sort((a, b) =>
                        Number(b.diffRate) - Number(a.diffRate)
                    );

                default:
                    return list;
            }
        },
        currentLabel() {
            if (this.sortType === 'recent') return '추가순';
            return this.options.find(o => o.value === this.sortType)?.label;
        }
    }
}
</script>
<style></style>
