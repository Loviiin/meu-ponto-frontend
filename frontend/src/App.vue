<template>

  <div id="app">
    <Header v-if="!$route.meta.hideNavbar" />
    <router-view />
    <Footer/>
  </div>
</template>

<script setup>
import Footer from './components/Footer.vue';
import Header from './components/Header.vue'
</script>

<style>
@import './style.css';
</style>