<template>
    <div class="embed-options">
      <h3 class="text-lg font-bold">How do you want to add TaxHutAppointments to your site?</h3>
      <div class="options">
        <button @click="selectOption('inline')" class="btn">Inline Embed</button>
        <button @click="selectOption('popup-widget')" class="btn">Popup Widget</button>
        <button @click="selectOption('popup-text')" class="btn">Popup Text</button>
      </div>
      <div v-if="selectedOption">
        <EmbedCode :option="selectedOption" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import EmbedCode from './EmbedCode.vue';
  
  const selectedOption = ref(null);
  
  const selectOption = (option) => {
    selectedOption.value = option;
  };
  </script>
  
  <style>
  .embed-options .btn {
    margin: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>
  