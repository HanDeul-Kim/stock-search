<template>
    marquee
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
            usdkrw: null,
            loading: true
        };
    },

    
}
</script>
<style>

</style>
