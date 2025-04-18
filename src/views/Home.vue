<template>
  <div class="home w-[80%] mx-auto h-full">
    <div class="flex items-center h-[85%]">
      <ProviderSelect
        v-model="currentProvider"
        :options="providerOptions"
      />
    </div>
    <div class="flex items-center h-[15%]">
      <MessageInput
        :disabled="!currentProvider"
        @send="createConversation"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProviderSelect from '@/components/Provider/ProviderSelect.vue';
import MessageInput from '@/components/MessageInput/index.vue';
import { db } from '@/store/indexDB';
import { useConversationStore } from '@/store/modules/conversation';
import { useProviderStore } from '@/store/modules/provider';
import { copyImageToUserDir } from '@/utils/images';

defineOptions({ name: 'Home' });

const router = useRouter();

const conversationStore = useConversationStore();
const providerStore = useProviderStore();

const currentProvider = ref('');

const providerOptions = computed(() => providerStore.items);

const modelInfo = computed(() => {
  const [ providerId, selectedModel ] = currentProvider.value.split('/');
  return {
    providerId: parseInt(providerId),
    selectedModel,
  };
});

const createConversation = async (question: string, imagePath?: string) => {
  const { providerId, selectedModel } = modelInfo.value;
  const currentDate = new Date().toISOString();
  let copiedImagePath: string | undefined;
  if (imagePath) {
    copiedImagePath = await copyImageToUserDir(imagePath);
  }

  const conversationId = await conversationStore.createConversation({
    providerId,
    selectedModel,
    title: question.slice(0, 30) + (question.length > 30 ? '...' : ''), 
    createdAt: currentDate,
    updatedAt: currentDate,
  });
  // 只存储在 indexDB 中，跳转到 conversation 页后新建聊天会执行 store 创建
  const newMessageId = await db.messages.add({
    content: question,
    conversationId,
    createdAt: currentDate,
    updatedAt: currentDate,
    type: 'question',
    ...(copiedImagePath && { imagePath: copiedImagePath }),
  });

  router.push({ path: `/conversation/${conversationId}`, query: { init: newMessageId } });
  conversationStore.selectedId = conversationId;
};
</script>

<style scoped></style>
