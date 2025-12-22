<template>
    <Header />
    <div class="container">
        <router-view></router-view>
    </div>
</template>

<script>
    import Header from './components/Header.vue'
    export default {
        name: 'App',
        data() {
            return {}
        },
        components: {
            Header,
        }
    }
</script>
<style></style>
