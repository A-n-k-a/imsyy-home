// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

// 获取高德地理位置信息
/*
export const getAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
  return await res.json();
};
*/
const CACHE_KEY = "__weather_adcode_cache__";
function loadAdcodeCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cache = JSON.parse(raw);
    if (!cache.expire || Date.now() > cache.expire) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return cache.data;
  } catch {
    return null;
  }
}
// 缓存时间计算：小时数 * 分钟数 * 秒数 * 毫秒数
export function saveAdcodeCache(data, ttlMs = 12 * 60 * 60 * 1000) {
  try {
    const cache = {
      expire: Date.now() + ttlMs,
      data
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}
export const getAdcode = async (key) => {
  // 0️⃣ 只读缓存
  const cached = loadAdcodeCache();
  if (cached) {
    return cached;
  }

  try {
    // IP API
    const ipRes = await fetch("https://api.ipapi.is");
    const ipData = await ipRes.json();

    const lat = ipData?.location?.latitude;
    const lon = ipData?.location?.longitude;
    if (!lat || !lon) throw new Error("IP 定位失败");

    // 高德逆地理
    const geoRes = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${lon},${lat}&extensions=base`
    );
    const geoData = await geoRes.json();

    if (geoData.infocode !== "10000") {
      throw new Error("逆地理失败");
    }

    const comp = geoData.regeocode.addressComponent;
    const city = Array.isArray(comp.city) ? comp.province : comp.city;

    return {
      status: "1",
      info: "OK",
      infocode: "10000",
      province: comp.province,
      city,
      adcode: comp.adcode,
      rectangle: ""
    };
  } catch (e) {
    console.error("[getAdcode error]", e);
    return {
      status: "0",
      info: "IP定位失败",
      infocode: "10001",
      province: "",
      city: "",
      adcode: "",
      rectangle: ""
    };
  }
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = async () => {
  const res = await fetch("https://api.oioweb.cn/api/weather/GetWeather");
  return await res.json();
};

// 自建Cloudflare Workers天气API，使用ip.sb定位，和风天气作数据源，日限1000次
export const getCFWeather = async () => {
  const res = await fetch(`https://ip-weather.anka1.top`);
  return await res.json();
};
