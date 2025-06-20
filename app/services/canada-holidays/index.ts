import axios from 'axios';

export const instance = axios.create({
  baseURL: 'https://canada-holidays.ca/api/v1',
  timeout: 0,
  withCredentials: true,
});

interface Holiday {
  id: number;
  date: string; // ISO date string (e.g., "2025-01-01")
  nameEn: string;
  nameFr: string;
  federal: number; // 1 for federal holiday, 0 otherwise
  observedDate: string; // ISO date string
}

interface Province {
  id: string; // e.g., "BC"
  nameEn: string;
  nameFr: string;
  sourceLink: string;
  sourceEn: string;
  holidays: Holiday[];
  nextHoliday: Holiday;
}

interface ProvinceData {
  province: Province;
}

export async function getProvinceHolidays(province: string) {
  const result = await instance.get<ProvinceData>(`/provinces/${province}`).then((res) => res.data);
  return result;
}
