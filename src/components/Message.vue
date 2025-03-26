<template>
  <!-- 基本信息 -->
  <div class="message">
    <!-- Logo -->
    <div class="logo">
      <img class="logo-img" :src="siteLogo" alt="logo" />
      <div :class="{ name: true, 'text-hidden': true, long: siteUrl[0].length >= 6 }">
        <!-- <span class="bg">{{ siteUrl[0] }}</span>
        <span class="sm">.{{ siteUrl[1] }}</span> -->
        <span class="bg">Hi</span>
        <span class="sm">, I'm Anka</span>
      </div>
    </div>
    <!-- 简介 -->
    <div class="description cards" @click="changeBox">
      <div class="content">
        <Icon size="16">
          <QuoteLeft />
        </Icon>
        <Transition name="fade" mode="out-in">
          <div :key="descriptionText.hello + descriptionText.text" class="text">
            <!-- <p>{{ descriptionText.hello }}</p> -->
            <!-- <p>{{ descriptionText.text }}</p> -->
            <p v-html="descriptionText.hello"></p>
            <p v-html="descriptionText.text"></p>
            <!-- <div id="hitokoto_div" class="description"><span>『</span>{{ hitokoto || ':D 一言获取中...' }}<span>』</span></div> -->
            <!-- <div id="fromWho_from" v-html="fromText" class="hitokoto-link"></div> -->
            <a :href="`https://hitokoto.cn/?uuid=${uuid}`" target="_blank" class="hitokoto-link">一言来自：hitokoto.cn</a>
          </div>
        </Transition>
        <Icon size="16">
          <QuoteRight />
        </Icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
import { QuoteLeft, QuoteRight } from "@vicons/fa";
import { Error } from "@icon-park/vue-next";
import { mainStore } from "@/store";
const store = mainStore();

// 主页站点logo
const siteLogo = import.meta.env.VITE_SITE_MAIN_LOGO;
// 站点链接
const siteUrl = computed(() => {
  const url = import.meta.env.VITE_SITE_URL;
  if (!url) return "imsyy.top".split(".");
  // 判断协议前缀
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const urlFormat = url.replace(/^(https?:\/\/)/, "");
    return urlFormat.split(".");
  }
  return url.split(".");
});

// 简介区域文字
const descriptionText = reactive({
  hello: import.meta.env.VITE_DESC_HELLO,
  text: import.meta.env.VITE_DESC_TEXT,
  // hello: hitokoto.value || import.meta.env.VITE_DESC_HELLO,
  // text: fromText.value || import.meta.env.VITE_DESC_TEXT,
});

// 切换右侧功能区
const changeBox = () => {
  if (store.getInnerWidth >= 721) {
    store.boxOpenState = !store.boxOpenState;
  } else {
    ElMessage({
      message: "当前页面宽度不足以开启盒子",
      grouping: true,
      icon: h(Error, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  }
};

// 我的自定义一言组件
import { ref, computed, onMounted, watch } from 'vue';
// import { useStore } from 'vuex';

const hitokoto = ref('');
const fromWho = ref('');
const from = ref('');
const uuid = ref('');

const fromText = computed(() => {
  if (fromWho.value && from.value) {
    return `——${fromWho.value}「${from.value}」`
    // return `<a :href="https://www.baidu.com/s?word=${fromWho.value}" target="_blank" class="hitokoto-link">——${fromWho.value}</a><a :href="https://www.baidu.com/s?word=${from.value}" target="_blank" class="hitokoto-link">「${from.value}」</a>`
    // return `——<span @click=\"() => window.location.href='https://www.baidu.com/s?word=${fromWho.value}'\" > ${fromWho.value} </span> 「<span @click=\"() => window.location.href='https://www.baidu.com/s?word=${from.value}'\" > ${from.value} </span>」`;
  } else if (from.value) {
    return `——「${from.value}」`
    // return `<a :href="https://www.baidu.com/s?word=${from.value}" target="_blank" class="hitokoto-link">——「${from.value}」</a>`
    // return `——「<span @click=\"() => window.location.href='https://www.baidu.com/s?word=${from.value}'\" > ${from.value} </span>」`;
  } else if (fromWho.value) {
    return `——${fromWho.value}`
    // return `<a :href="https://www.baidu.com/s?word=${fromWho.value}" target="_blank" class="hitokoto-link">——${fromWho.value}</a>`
    // return `——<span @click=\"() => window.location.href='https://www.baidu.com/s?word=${fromWho.value}'\" > ${fromWho.value} </span>`;
  } else {
    return '作者/来源获取中...';
  }
});

const fetchHitokoto = async () => {
  try {
    const response = await fetch('https://v1.hitokoto.cn/');
    const data = await response.json();
    
    hitokoto.value = data.hitokoto;
    fromWho.value = data.from_who;
    from.value = data.from;
    uuid.value = data.uuid;

    descriptionText.hello = hitokoto.value || import.meta.env.VITE_DESC_HELLO;
    descriptionText.text = fromText.value || import.meta.env.VITE_DESC_TEXT;
  } catch (error) {
    console.error('Error fetching hitokoto:', error);
  }
};

onMounted(fetchHitokoto);

// 监听状态变化
watch(
  () => store.boxOpenState,
  (value) => {
    if (value) {
      descriptionText.hello = import.meta.env.VITE_DESC_HELLO_OTHER;
      descriptionText.text = import.meta.env.VITE_DESC_TEXT_OTHER;
    } else {
      descriptionText.hello = hitokoto.value || import.meta.env.VITE_DESC_HELLO;
      descriptionText.text = fromText || import.meta.env.VITE_DESC_TEXT;
    }
  },
);
</script>

<!-- 自定义一言组件所需样式 -->
<style scoped>
.purpleText {
  color: purple;
}
.textBackground {
  cursor: pointer;
  text-decoration: underline;
}
.hitokoto-link {
  margin-top: 10px;
  font-weight: bold;
  align-self: flex-end;
  font-size: 1.1rem;
}
</style>

<style lang="scss" scoped>
.message {
  .logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    animation: fade 0.5s;
    max-width: 460px;
    .logo-img {
      border-radius: 50%;
      width: 120px;
    }
    .name {
      width: 100%;
      padding-left: 22px;
      transform: translateY(-8px);
      font-family: "Pacifico-Regular";

      .bg {
        font-size: 5rem;
      }

      .sm {
        margin-left: 6px;
        font-size: 2rem;
        @media (min-width: 721px) and (max-width: 789px) {
          display: none;
        }
      }
    }
    @media (max-width: 768px) {
      .logo-img {
        width: 100px;
      }
      .name {
        height: 128px;
        .bg {
          font-size: 4.5rem;
        }
      }
    }

    @media (max-width: 720px) {
      max-width: 100%;
    }
  }

  .description {
    padding: 1rem;
    margin-top: 3.5rem;
    max-width: 460px;
    animation: fade 0.5s;

    .content {
      display: flex;
      justify-content: space-between;

      .text {
        margin: 0.75rem 1rem;
        line-height: 2rem;
        margin-right: auto;
        transition: opacity 0.2s;

        p {
          &:nth-of-type(1) {
            font-family: "Pacifico-Regular";
          }
          // 新增的右对齐样式
          &:nth-of-type(2) {
            text-align: right;
          }
        }
      }

      .xicon:nth-of-type(2) {
        align-self: flex-end;
      }
    }
    @media (max-width: 720px) {
      max-width: 100%;
      pointer-events: none;
    }
  }
  // @media (max-width: 390px) {
  //   .logo {
  //     flex-direction: column;
  //     .logo-img {
  //       display: none;
  //     }
  //     .name {
  //       margin-left: 0;
  //       height: auto;
  //       transform: none;
  //       text-align: center;
  //       .bg {
  //         font-size: 3.5rem;
  //       }
  //       .sm {
  //         font-size: 1.4rem;
  //       }
  //     }
  //   }
  //   .description {
  //     margin-top: 2.5rem;
  //   }
  // }
}
</style>