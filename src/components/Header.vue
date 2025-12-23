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
    
</template>

<script>
import SearchBar from './SearchBar.vue';
export default {
    name: 'Header',
    data() {
        return {};
    },
    components: {
        SearchBar
    },
    
}
</script>
<style></style>
