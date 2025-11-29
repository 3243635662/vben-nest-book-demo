<template>
  <div class="m-4 mr-0 overflow-hidden bg-white">
    <BasicTree
      title="地区列表"
      toolbar
      search
      treeWrapperClassName="h-[calc(100%-35px)] overflow-auto"
      :clickRowToExpand="false"
      :treeData="treeData"
      :fieldNames="{ key: 'text', title: 'merchantName' }"
      @select="handleSelect"
    />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';

  import { BasicTree, TreeItem } from '@/components/Tree';
  import { getArea } from '@/api/demo/system';

  defineOptions({ name: 'MerchantTree' });

  const emit = defineEmits(['select']);

  const treeData = ref<TreeItem[]>([]);

  async function fetchMerchants() {
    treeData.value = (await getArea()).map((item) => ({
      ...item,
      merchantName: item.text,
    })) as unknown as TreeItem[];
    console.log(treeData.value);
  }

  function handleSelect(keys) {
    console.log('handleSelect', keys);

    emit('select', keys[0]);
  }

  onMounted(() => {
    fetchMerchants();
  });
</script>
