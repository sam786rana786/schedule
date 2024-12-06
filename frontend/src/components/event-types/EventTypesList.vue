<!-- src/components/event-types/EventTypesList.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useEventTypeStore } from '@/stores/eventType';
import { useNotificationStore } from '@/stores/notification';
import { ShareIcon, ClipboardIcon, Pencil } from 'lucide-vue-next';
import type { EventType } from '@/types/eventType';
import { Switch } from '@headlessui/vue';
import EmbedCode from './EmbedCode.vue';

interface IframeConfig {
  width?: string;
  height?: string;
  style?: string;
}

const defaultIframeConfig: IframeConfig = {
  width: '100%',
  height: '700px',
  style: 'border: none; border-radius: 4px;'
};

defineProps<{
  eventTypes: Array<EventType>;
  isLoading: boolean;
}>();

const emit = defineEmits(['toggle']);

const handleToggle = (id: number) => {
  emit('toggle', id);
};

const router = useRouter();
const eventTypeStore = useEventTypeStore();
const notificationStore = useNotificationStore();
const selectedEventType = ref<EventType | null>(null);
const showEmbedModal = ref(false);
const showShareModal = ref(false);
const activeTab = ref('link');
const selectedEmbedOption = ref<string | null>(null);

onMounted(async () => {
  try {
    await eventTypeStore.fetchEventTypes();
  } catch (error) {
    console.error('Failed to fetch event types:', error);
  }
});

const handleEdit = (eventType: EventType) => {
  router.push(`/dashboard/event-types/${eventType.id}/edit`);
};

const handleEmbed = (eventType: EventType) => {
  selectedEventType.value = eventType;
  showEmbedModal.value = true;
};

const handleShare = (eventType: EventType) => {
  selectedEventType.value = eventType;
  showShareModal.value = true;
};

const getEmbedCode = (option: string, eventType: EventType, config: IframeConfig = defaultIframeConfig) => {
  const baseUrl = `${window.location.origin}/schedule/${eventType.slug}`;
  
  switch (option) {
    case 'inline':
      return `<iframe 
        src="${baseUrl}"
        width="${config.width}"
        height="${config.height}"
        style="${config.style}"
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
      <//script>`;
    default:
      return '';
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    notificationStore.showNotification('success', 'Copied to clipboard!');
  } catch (err) {
    notificationStore.showNotification('error', 'Failed to copy');
  }
};

const copyEmbedCode = async (eventType: EventType) => {
  try {
    await navigator.clipboard.writeText(getEmbedCode(selectedEmbedOption.value || '', eventType));
    alert('Embed code copied!');
  } catch (err) {
    console.error('Failed to copy embed code:', err);
  }
};

const copyLink = async (slug: string) => {
  const link = `${window.location.origin}/schedule/${slug}`;
  try {
    await navigator.clipboard.writeText(link);
    notificationStore.showNotification('success', 'Link copied to clipboard');
  } catch (error) {
    notificationStore.showNotification('error', 'Failed to copy link');
  }
};

const handleEmbedOptionSelect = (option: string) => {
  selectedEmbedOption.value = option;
};

const shareViaEmail = (eventType: EventType) => {
  const url = `${window.location.origin}/schedule/${eventType.slug}`;
  const subject = encodeURIComponent('Schedule time with me');
  const body = encodeURIComponent(`Please use this link to schedule time with me: ${url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};
const emailLink = computed(() => {
  if (!selectedEventType.value) return '';
  const url = `${window.location.origin}/schedule/${selectedEventType.value.slug}`;
  const subject = 'Schedule time with me';
  const body = `Please use this link to schedule time with me: ${url}`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// Fix window type issue by declaring it
declare const window: Window & typeof globalThis;
</script>

<template>
  <div v-if="isLoading" class="flex justify-center py-8">
    <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
  </div>
  
  <div v-else class="space-y-4">
    <!-- List container replacing grid -->
    <div v-for="eventType in eventTypes" 
         :key="eventType.id"
         class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div class="p-6">
        <!-- Event Type Header -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ eventType.name }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ eventType.duration }} minutes</p>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center space-x-3">
            <button
              @click="copyLink(eventType.slug)"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ClipboardIcon class="h-4 w-4 mr-2" />
              Copy Link
            </button>
            
            <button
              @click="handleEmbed(eventType)"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ShareIcon class="h-4 w-4 mr-2" />
              Share
            </button>
            <button
              @click="handleEdit(eventType)"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Pencil  class="h-4 w-4 mr-2" />
              Edit
            </button>

            <!-- Toggle Switch -->
            <Switch
              v-model="eventType.is_active"
              @change="handleToggle(eventType.id)"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="eventType.is_active ? 'bg-blue-600' : 'bg-gray-200'"
            >
              <span class="sr-only">Toggle availability</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="eventType.is_active ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
          </div>
        </div>

        <!-- Event Type Details -->
        <div class="mt-4 text-sm text-gray-500">
          <p>{{ eventType.description }}</p>
          <div class="mt-2 flex items-center space-x-4">
            <span class="inline-flex items-center">
              <ClockIcon class="h-4 w-4 mr-1" />
              {{ eventType.duration }} mins
            </span>
            <span class="inline-flex items-center">
              <LinkIcon class="h-4 w-4 mr-1" />
              /{{ eventType.slug }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Embed Modal -->
  <div v-if="showEmbedModal && selectedEventType" 
       class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-medium">Share "{{ selectedEventType.name }}"</h3>
        <button @click="showEmbedModal = false" class="text-gray-400 hover:text-gray-500">
          <span class="sr-only">Close</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Share Options -->
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="option in ['inline', 'popup-widget', 'popup-text']"
            :key="option"
            @click="handleEmbedOptionSelect(option)"
            class="p-4 border rounded-lg text-left hover:border-blue-500"
            :class="{ 'border-blue-500': selectedEmbedOption === option }"
          >
            {{ option }}
          </button>
        </div>

        <!-- Embed Code -->
        <EmbedCode
          v-if="selectedEmbedOption"
          :option="selectedEmbedOption"
          :event-type-slug="selectedEventType.slug"
        />

        <!-- Email Share -->
        <button
          @click="shareViaEmail(selectedEventType)"
          class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Share via Email
        </button>
      </div>
    </div>
  </div>

  <!-- Share Modal -->
  <div v-if="showShareModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-medium">Share "{{ selectedEventType?.name }}"</h3>
        <button @click="showShareModal = false" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in ['link', 'email', 'embed']"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="mt-4">
        <!-- Link Tab -->
        <div v-if="activeTab === 'link'" class="space-y-4">
          <div class="relative">
            <input
              type="text"
              readonly
              :value="`${window.location.origin}/schedule/${selectedEventType?.slug}`"
              class="block w-full pr-24 border-gray-300 rounded-md shadow-sm"
            />
            <button
              @click="copyToClipboard(`${window.location.origin}/schedule/${selectedEventType?.slug}`)"
              class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ClipboardIcon class="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>
        </div>

        <!-- Email Tab -->
        <div v-if="activeTab === 'email'" class="space-y-4">
          <a
            :href="emailLink"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Add times to email
          </a>
        </div>

        <!-- Embed Tab -->
        <div v-if="activeTab === 'embed'" class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium mb-4">Embed Options</h3>
            
            <!-- Embed Type Selection -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <button
                v-for="option in ['inline', 'popup-widget']"
                :key="option"
                @click="selectedEmbedOption = option"
                class="p-4 border rounded-lg text-left transition-all"
                :class="selectedEmbedOption === option ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-blue-300'"
              >
                <div class="font-medium mb-1">
                  {{ option === 'inline' ? 'Inline Embed' : 'Popup Widget' }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ option === 'inline' ? 'Embed directly on your page' : 'Show as a popup overlay' }}
                </div>
              </button>
            </div>

            <!-- Preview -->
            <div v-if="selectedEmbedOption === 'inline' && selectedEventType" class="mb-6">
              <h4 class="text-md font-medium mb-2">Preview</h4>
              <div class="border rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  :src="`${window.location.origin}/schedule/${selectedEventType.slug}`"
                  width="100%"
                  height="500px"
                  style="border: none;"
                  frameborder="0"
                ></iframe>
              </div>
            </div>

            <!-- Embed Code -->
            <div v-if="selectedEmbedOption && selectedEventType">
              <h4 class="text-md font-medium mb-2">Embed Code</h4>
              <div class="relative">
                <textarea
                  readonly
                  rows="6"
                  :value="getEmbedCode(selectedEmbedOption, selectedEventType)"
                  class="w-full font-mono text-sm p-4 bg-gray-50 border rounded-lg"
                ></textarea>
                <button
                  @click="copyToClipboard(getEmbedCode(selectedEmbedOption, selectedEventType))"
                  class="absolute top-2 right-2 px-3 py-1 text-sm border rounded-md bg-white shadow-sm hover:bg-gray-50"
                >
                  <ClipboardIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.embed-preview iframe {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>