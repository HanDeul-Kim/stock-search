<template>
    <div class="marquee-container" id="tickerContainer">
        <div class="marquee-wrap" id="tickerWrapper">
            <div v-if="indices.kospi">
                <div class="marquee">{{ transFormText(indices.kospi.idxNm) }}
                    <span :class="getColorClass(indices.kospi.vs)">{{
                        indices.kospi.clpr }} {{
                            getSign(indices.kospi.vs) }} {{ indices.kospi.vs }}
                        ({{ Number(indices.kospi.fltRt).toFixed(2) }}%)</span>
                </div>
            </div>
            <div v-if="indices.kosdaq">
                <div class="marquee">{{ transFormText(indices.kosdaq.idxNm) }}
                    <span :class="getColorClass(indices.kosdaq.vs)">{{
                        indices.kosdaq.clpr }} {{
                            getSign(indices.kosdaq.vs) }} {{ indices.kosdaq.vs }}
                        ({{ Number(indices.kosdaq.fltRt).toFixed(2) }}%)</span>
                </div>
            </div>
            <div v-if="indices.kospi">
                <div class="marquee">{{ transFormText(indices.kospi.idxNm) }}
                    <span :class="getColorClass(indices.kospi.vs)">{{
                        indices.kospi.clpr }} {{
                            getSign(indices.kospi.vs) }} {{ indices.kospi.vs }}
                        ({{ Number(indices.kospi.fltRt).toFixed(2) }}%)</span>
                </div>
            </div>
            <div v-if="indices.kosdaq">
                <div class="marquee">{{ transFormText(indices.kosdaq.idxNm) }}
                    <span :class="getColorClass(indices.kosdaq.vs)">{{
                        indices.kosdaq.clpr }} {{
                            getSign(indices.kosdaq.vs) }} {{ indices.kosdaq.vs }}
                        ({{ Number(indices.kosdaq.fltRt).toFixed(2) }}%)</span>
                </div>
            </div>
            <div v-if="indices.kospi">
                <div class="marquee">{{ transFormText(indices.kospi.idxNm) }}
                    <span :class="getColorClass(indices.kospi.vs)">{{
                        indices.kospi.clpr }} {{
                            getSign(indices.kospi.vs) }} {{ indices.kospi.vs }}
                        ({{ Number(indices.kospi.fltRt).toFixed(2) }}%)</span>
                </div>
            </div>
            <div v-if="indices.kosdaq">
                <div class="marquee">{{ transFormText(indices.kosdaq.idxNm) }}
                    <span :class="getColorClass(indices.kosdaq.vs)">{{
                        indices.kosdaq.clpr }} {{
                            getSign(indices.kosdaq.vs) }} {{ indices.kosdaq.vs }}
                        ({{ Number(indices.kosdaq.fltRt).toFixed(2) }}%)</span>
                </div>
            </div>
        </div>
    </div>

    
</template>

<script>
import axios from 'axios';
export default {
    name: 'Marquee',
    data() {
        return {
            indices: {
                kospi: null,
                kosdaq: null
            },
            loading: true
        };
    },
    methods: {
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

                // $nextTick는 dom 접근 실패때문에, vue가 dom 업데이트 끝나고 다음 코드 실행해줘임.
                this.$nextTick(() => {
                    this.initMarquee();
                });
            } catch (error) {
                console.error("데이터 호출 에러:", error);
            } finally {
                this.loading = false;
            }
        },
        initMarquee() {
            const wrapper = document.getElementById('tickerWrapper');
            const clone = wrapper.innerHTML;
            wrapper.innerHTML = clone + clone;
        },
        transFormText(name) {
            if(name == '코스피') 
            return 'KOSPI'

            if(name == '코스닥') 
            return 'KOSDAQ'
            
        }
    },
    mounted() {
        // 지수 불러오기
        this.fetchMarketData();
    }


}
</script>
<style>

</style>
