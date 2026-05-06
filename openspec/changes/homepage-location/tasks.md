## 1. Utils & Store

- [x] 1.1 Create `miniapp/src/utils/location.js` with `getCurrentCity()`, `matchCityByCoords()`, `getAllCities()` functions
- [x] 1.2 Create `miniapp/src/stores/location.js` Pinia store with `currentCity`, `selectedCity`, `loadCity()`, `saveCity()`

## 2. Frontend - Home Page Integration

- [x] 2.1 Add `showCityModal` ref to `index/index.vue`
- [x] 2.2 Add `location.js` imports and city selection logic to `index/index.vue`
- [x] 2.3 Add `@click="openCityModal"` to location element in template
- [x] 2.4 Display `currentCity` in navigation bar instead of hardcoded "上海"

## 3. Frontend - City Selection Popup

- [x] 3.1 Create `miniapp/src/components/CitySelectModal.vue` with:
  - Search input
  - Popular cities horizontal section
  - Full city list (scrollable)
  - "使用定位" button
- [x] 3.2 Emit `confirm(city)` event when city selected
- [x] 3.3 Import and use `CitySelectModal` in `index.vue`