<template>
  <div>
    <h4 class="text-md font-semibold">Embed Code for {{ option }}</h4>
    <textarea v-if="code" class="embed-code" readonly>{{ code }}</textarea>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  option: string;
  eventTypeSlug: string;
}

const props = defineProps<Props>();

const code = computed(() => {
  const baseUrl = `${window.location.origin}/schedule/${props.eventTypeSlug}`;
  
  switch (props.option) {
    case 'inline':
      return `<iframe 
        src="${baseUrl}"
        width="100%"
        height="700px"
        style="border:none;"
        frameborder="0"
      ></iframe>`;
    case 'popup-widget':
      return `<script>
        window.addEventListener('load', function() {
          const btn = document.createElement('button');
          btn.innerText = 'Schedule Meeting';
          btn.onclick = function() {
            const iframe = document.createElement('iframe');
            iframe.src = '${baseUrl}';
            iframe.style = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; height: 80%; border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1000;';
            document.body.appendChild(iframe);
          };
          document.body.appendChild(btn);
        });
      <\/script>`;
    case 'popup-text':
      return `<a href="" onclick="Scheduling.showPopupWidget('${baseUrl}');return false;">Schedule time with me</a>`;
    default:
      return '';
  }
});
</script>

<style scoped>
.embed-code {
  width: 100%;
  height: 150px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  font-family: monospace;
}
</style>