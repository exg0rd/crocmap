// Координаты городов России для маппинга на карте
// Источник: открытые данные геокодирования

export interface CityCoordinates {
  latitude: number;
  longitude: number;
}

export const RUSSIAN_CITIES_COORDINATES: Record<string, CityCoordinates> = {
  'москва': { latitude: 55.7558, longitude: 37.6173 },
  'санкт-петербург': { latitude: 59.9343, longitude: 30.3351 },
  'новосибирск': { latitude: 55.0084, longitude: 82.9357 },
  'екатеринбург': { latitude: 56.8389, longitude: 60.6057 },
  'казань': { latitude: 55.7964, longitude: 49.1089 },
  'нижний новгород': { latitude: 56.3269, longitude: 44.0076 },
  'челябинск': { latitude: 55.1644, longitude: 61.4368 },
  'самара': { latitude: 53.1959, longitude: 50.1002 },
  'омск': { latitude: 54.9914, longitude: 73.3686 },
  'ростов-на-дону': { latitude: 47.2225, longitude: 39.7188 },
  'уфа': { latitude: 54.7388, longitude: 55.9721 },
  'красноярск': { latitude: 56.0153, longitude: 92.8932 },
  'воронеж': { latitude: 51.6608, longitude: 39.2003 },
  'пермь': { latitude: 58.0105, longitude: 56.2502 },
  'волгоград': { latitude: 48.7080, longitude: 44.5133 },
  'краснодар': { latitude: 45.0355, longitude: 38.9753 },
  'саратов': { latitude: 51.5924, longitude: 46.0348 },
  'тюмень': { latitude: 57.1522, longitude: 65.5272 },
  'тольятти': { latitude: 53.5303, longitude: 49.3461 },
  'ижерск': { latitude: 57.0727, longitude: 56.0191 },
  'барнаул': { latitude: 53.3606, longitude: 83.7636 },
  'ульяновск': { latitude: 54.3142, longitude: 48.4031 },
  'иркутск': { latitude: 52.2869, longitude: 104.2806 },
  'владивосток': { latitude: 43.1198, longitude: 131.8869 },
  'ярославль': { latitude: 57.6261, longitude: 39.8845 },
  'магнитогорск': { latitude: 53.4078, longitude: 59.0417 },
  'тверь': { latitude: 56.8584, longitude: 35.9004 },
  'севастополь': { latitude: 44.6167, longitude: 33.5254 },
  'симферополь': { latitude: 44.9521, longitude: 34.1024 },
  'калининград': { latitude: 54.7104, longitude: 20.4522 },
  'мурманск': { latitude: 68.9585, longitude: 33.0827 },
  'архангельск': { latitude: 64.5401, longitude: 40.5433 },
  'петрозаводск': { latitude: 61.7849, longitude: 34.3469 },
  'сыктывкар': { latitude: 61.6682, longitude: 50.8077 },
  'нижневартовск': { latitude: 60.9344, longitude: 76.5518 },
  'сургут': { latitude: 61.2547, longitude: 73.3969 },
  'новый уренгой': { latitude: 66.0833, longitude: 76.6167 },
  'ноябрьск': { latitude: 63.1956, longitude: 75.4336 },
  'ханты-мансийск': { latitude: 61.0042, longitude: 69.0019 },
  'салехард': { latitude: 66.5307, longitude: 66.6022 },
  'воркута': { latitude: 67.4959, longitude: 64.0514 },
  'инта': { latitude: 66.0431, longitude: 60.1197 },
  'печора': { latitude: 65.1167, longitude: 57.2833 },
  'усинск': { latitude: 65.9514, longitude: 57.5356 },
  'наръян-мар': { latitude: 67.6381, longitude: 53.0069 },
  'амдерма': { latitude: 69.7533, longitude: 61.5611 },
};

/**
 * Получить координаты города по названию
 * @param cityName - Название города (регистронезависимое)
 * @returns Координаты города или null, если город не найден
 */
export function getCityCoordinates(cityName: string): CityCoordinates | null {
  const normalizedCityName = cityName.toLowerCase().trim();
  
  // Прямое совпадение
  if (RUSSIAN_CITIES_COORDINATES[normalizedCityName]) {
    return RUSSIAN_CITIES_COORDINATES[normalizedCityName];
  }
  
  // Частичное совпадение (для составных названий)
  for (const [key, coords] of Object.entries(RUSSIAN_CITIES_COORDINATES)) {
    if (key.includes(normalizedCityName) || normalizedCityName.includes(key)) {
      return coords;
    }
  }
  
  return null;
}

/**
 * Проверить, есть ли город в базе координат
 * @param cityName - Название города
 * @returns true, если город найден
 */
export function hasCityCoordinates(cityName: string): boolean {
  return getCityCoordinates(cityName) !== null;
}

/**
 * Добавить новый город в базу координат (для динамического добавления)
 * @param cityName - Название города
 * @param latitude - Широта
 * @param longitude - Долгота
 */
export function addCityCoordinates(
  cityName: string,
  latitude: number,
  longitude: number
): void {
  const normalizedCityName = cityName.toLowerCase().trim();
  RUSSIAN_CITIES_COORDINATES[normalizedCityName] = { latitude, longitude };
}
