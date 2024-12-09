<template>
  <div>
    <h4 class="text-md font-semibold">Embed Code for {{ option }}</h4>
    
    <!-- View Toggle -->
    <div class="flex space-x-4 mb-4">
      <button 
        @click="activeView = 'code'"
        :class="{'bg-blue-500 text-white': activeView === 'code'}"
        class="px-4 py-2 rounded-md"
      >
        Code
      </button>
      <button 
        @click="activeView = 'preview'"
        :class="{'bg-blue-500 text-white': activeView === 'preview'}"
        class="px-4 py-2 rounded-md"
      >
        Preview
      </button>
    </div>

    <!-- Code View -->
    <textarea 
      v-if="activeView === 'code'" 
      class="embed-code" 
      readonly
    >{{ code }}</textarea>

    <!-- Preview View -->
    <div v-else class="preview-container">
      <!-- Inline Preview -->
      <iframe
        v-if="option === 'inline'"
        :src="`${baseUrl}/schedule/${eventTypeSlug}`"
        width="100%"
        height="500px"
        style="border: 1px solid #e5e7eb; border-radius: 8px;"
        frameborder="0"
      ></iframe>

      <!-- Popup Widget Preview -->
      <div v-if="option === 'popup-widget'" class="text-center p-4">
        <button
          @click="showPopupPreview = true"
          class="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Schedule Meeting
        </button>
        
        <!-- Popup Preview Modal -->
        <div v-if="showPopupPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div class="relative w-4/5 h-4/5">
            <button 
              @click="showPopupPreview = false"
              class="absolute top-2 right-2 text-white"
            >
              ✕
            </button>
            <iframe
              :src="`${baseUrl}/schedule/${eventTypeSlug}`"
              class="w-full h-full rounded-lg"
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>

      <!-- Popup Text Preview -->
      <div v-if="option === 'popup-text'" class="text-center p-4">
        <a 
          href="#" 
          @click.prevent="showPopupPreview = true"
          class="text-blue-500 hover:underline"
        >
          Schedule time with me
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  option: string;
  eventTypeSlug: string;
}>();

const activeView = ref('code');
const showPopupPreview = ref(false);
const baseUrl = window.location.origin;
const slug = props.eventTypeSlug

const code = computed(() => {  
  switch (props.option) {
    case 'inline':
      return `<iframe 
        src="${baseUrl}/schedule/${slug}"
        width="100%"
        height="700px"
        style="border:none;"
        frameborder="0"
      ></iframe>`;
    case 'popup-widget':
      return `<script>
  window.addEventListener('load', function() {
    // Configuration options
    window.schedulerButtonPosition = 'right'; // 'left' or 'right'
    window.schedulerButtonColor = '#3B82F6';  // Set custom color here

    const btn = document.createElement('button');
    btn.innerText = 'Schedule Meeting';
    
    // Button styling with custom color
    btn.style.cssText = \`
      position: fixed;
      bottom: 20px;
      \${window.schedulerButtonPosition === 'left' ? 'left: 20px;' : 'right: 20px;'};
      padding: 12px 24px;
      background-color: \${window.schedulerButtonColor || '#3B82F6'};
      color: white;
      border: none;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 999;
      transition: all 0.2s ease;
    \`;

    // Hover effect with darker shade
    btn.onmouseover = function() {
      const darkerColor = adjustColor(window.schedulerButtonColor || '#3B82F6', -20); # #f72585, 7209b7, 3a0ca3, 4361ee, 4cc9f0
      btn.style.backgroundColor = darkerColor;
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    };
    
    btn.onmouseout = function() {
      btn.style.backgroundColor = window.schedulerButtonColor || '#3B82F6';
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    };

    // Helper function to darken color for hover effect
    function adjustColor(color, amount) {
      return '#' + color.replace(/^#/, '').replace(/../g, color => 
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
      );
    }

    // Rest of the existing code...
    btn.onclick = function() {
      const iframe = document.createElement('iframe');
      iframe.src = '${baseUrl}/schedule/${slug}';
      iframe.style.cssText = \`
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        background: white;
      \`;
      document.body.appendChild(iframe);

      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 8px;
        background: rgba(0,0,0,0.5);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        z-index: 1001;
      \`;
      closeBtn.onclick = function() {
        iframe.remove();
        closeBtn.remove();
      };
      document.body.appendChild(closeBtn);
    };

    document.body.appendChild(btn);
  });
</\script>`;
    case 'popup-text':
      return `
<!-- Add this script tag first -->
<script>
  window.Scheduling = {
    showPopupWidget: function(url) {
      // Create and style iframe
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.cssText = \`
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        background: white;
      \`;
      document.body.appendChild(iframe);

      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 8px;
        background: rgba(0,0,0,0.5);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        z-index: 1001;
      \`;
      closeBtn.onclick = function() {
        iframe.remove();
        closeBtn.remove();
      };
      document.body.appendChild(closeBtn);
    }
  };
<\/script>

<!-- Add the link after the script -->
<a href="#" onclick="Scheduling.showPopupWidget('${baseUrl}/schedule/${slug}'); return false;">
  Schedule time with me
</a>`;

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

.preview-container {
  min-height: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
</style>