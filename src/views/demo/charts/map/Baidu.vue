<template>
  <div ref="wrapRef" :style="{ height, width }"></div>
</template>

<script lang="ts" setup>
  import { ref, nextTick, unref, onMounted } from 'vue';
  import { useScript } from '@/hooks/web/useScript';
  // import { useUserStore } from '@/store/modules/user';
  // import { storeToRefs } from 'pinia';

  // const userStore = useUserStore();
  // const { IP } = storeToRefs(userStore);

  defineOptions({ name: 'BaiduMap' });

  defineProps({
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: 'calc(100vh - 78px)',
    },
  });

  const AK = 'lDZkuGJxwaLNt66CYWUB1AtkFYLwf69U';
  // 修复：移除 URL 中的空格
  const BAI_DU_MAP_URL = `https://api.map.baidu.com/getscript?v=3.0&ak=${AK}`;

  const wrapRef = ref<HTMLDivElement | null>(null);
  const { toPromise } = useScript({ src: BAI_DU_MAP_URL });

  async function initMap() {
    await toPromise();
    await nextTick();
    
    const wrapEl = unref(wrapRef);
    if (!wrapEl) return;

    const BMap = (window as any).BMap;
    const map = new BMap.Map(wrapEl);
    
    // 启用缩放
    map.enableScrollWheelZoom(true);

    // 添加控件
    const cityListControl = new BMap.CityListControl({
      anchor: BMap.BMAP_ANCHOR_TOP_LEFT,
      offset: new BMap.Size(10, 10)
    });
    
    const mapTypeControl = new BMap.MapTypeControl({
      anchor: BMap.BMAP_ANCHOR_TOP_RIGHT,
      offset: new BMap.Size(10, 10)
    });
    
    map.addControl(cityListControl);
    map.addControl(mapTypeControl);

    // IP定位到城市
    const cityLocation = new BMap.LocalCity();
    
    cityLocation.get((result: any) => {
      // 获取IP定位的城市中心点
      const cityPoint = result.center;
      const cityName = result.name;
      
      // 定位到该城市，设置适当的缩放级别
      map.centerAndZoom(cityPoint, 12);
      
      // 可选：在控制台输出定位信息
      console.log(`IP定位成功：${cityName}`, result);
      
      // 可选：添加标注
      const marker = new BMap.Marker(cityPoint);
      map.addOverlay(marker);
      
      // 添加信息窗口显示城市名
      const infoWindow = new BMap.InfoWindow(`当前定位城市：${cityName}`);
      marker.addEventListener('click', () => {
        map.openInfoWindow(infoWindow, cityPoint);
      });
    });

    // 备选：如果IP定位失败或你想使用Pinia中的IP
    // 注意：百度LocalCity是自动获取客户端IP，不需要手动传入
    // 如果需要根据指定IP查询，需要调用后端接口或百度LBS云服务
  }

  onMounted(async () => {
    await initMap();
  });
</script>
