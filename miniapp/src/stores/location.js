import { defineStore } from 'pinia';
import { getSavedCity, saveCity as persistCity, getPopularCities, getAllCities, getCurrentCity } from '@/utils/location.js';

export const useLocationStore = defineStore('location', {
  state: () => ({
    currentCity: null,
    savedCity: null,
  }),

  getters: {
    displayCity: (state) => {
      return state.currentCity?.label || state.savedCity?.label || '上海';
    },
  },

  actions: {
    init() {
      const saved = getSavedCity();
      if (saved) {
        this.savedCity = saved;
        this.currentCity = saved;
      }
    },

    async detectCity() {
      try {
        const city = await getCurrentCity();
        if (city) {
          this.currentCity = city;
          return city;
        }
      } catch (e) {
        console.error('定位失败', e);
      }
      return null;
    },

    setCity(city) {
      this.currentCity = city;
      this.savedCity = city;
      persistCity(city);
    },

    getPopularCities() {
      return getPopularCities();
    },

    getAllCities() {
      return getAllCities();
    },
  },
});