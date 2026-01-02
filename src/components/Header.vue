<template>
    <header>
        <nav>
            <div class="gnb">
                <li>
                    <router-link to="/">Home</router-link>
                </li>
            </div>
            <SearchBar />
        </nav>
    </header>
    <!-- <Marquee /> -->
</template>

<script>
import SearchBar from './SearchBar.vue';
import Marquee from './Marquee.vue';
export default {
    name: 'Header',
    data() {
        return {};
    },
    components: {
        SearchBar,
        Marquee
    },
    
}
</script>
<style></style>
