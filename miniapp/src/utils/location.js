import { regionData } from './regionData.js';

const POPULAR_CITIES = [
  { label: '北京', value: '110000', lat: 40.0, lng: 116.4 },
  { label: '上海', value: '310000', lat: 31.3, lng: 121.5 },
  { label: '广州', value: '440100', lat: 23.1, lng: 113.3 },
  { label: '深圳', value: '440300', lat: 22.5, lng: 114.1 },
  { label: '杭州', value: '330100', lat: 30.3, lng: 120.2 },
  { label: '成都', value: '510100', lat: 30.7, lng: 104.1 },
  { label: '武汉', value: '420100', lat: 30.6, lng: 114.3 },
  { label: '重庆', value: '500000', lat: 29.5, lng: 106.5 },
  { label: '南京', value: '320100', lat: 32.0, lng: 118.8 },
  { label: '西安', value: '610100', lat: 34.3, lng: 108.9 },
];

export function getAllCities() {
  const cities = [];
  for (const province of regionData) {
    if (province.children) {
      for (const city of province.children) {
        if (city.value.endsWith('00') && city.value !== province.value) {
          const match = POPULAR_CITIES.find(c => c.value === city.value);
          cities.push({
            label: city.label,
            value: city.value,
            lat: match?.lat || 0,
            lng: match?.lng || 0,
          });
        }
      }
    }
  }
  return cities;
}

export function getPopularCities() {
  return POPULAR_CITIES;
}

export function matchCityByCoords(lat, lng) {
  let closest = null;
  let minDist = Infinity;
  for (const city of POPULAR_CITIES) {
    const dist = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
    if (dist < minDist) {
      minDist = dist;
      closest = city;
    }
  }
  if (minDist < 0.5) {
    return closest;
  }
  return null;
}

export function getCurrentCity() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        const city = matchCityByCoords(res.latitude, res.longitude);
        if (city) {
          resolve(city);
        } else {
          resolve(null);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

export function getSavedCity() {
  return uni.getStorageSync('selected_city') || null;
}

export function saveCity(city) {
  uni.setStorageSync('selected_city', city);
}