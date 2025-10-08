<template>

  <div id="app">
    <Header v-if="!$route.meta.hideNavbar" />
    <router-view />
    <Footer/>
    <FloatingPunch v-if="!$route.meta.hidePunchButton" />
    <ToastContainer />
  </div>
</template>

<script setup>
import Footer from './components/Footer.vue';
import Header from './components/Header.vue'
import FloatingPunch from './components/FloatingPunch.vue';
import ToastContainer from './components/ToastContainer.vue';
</script>

<style>
@import './style.css';
</style>