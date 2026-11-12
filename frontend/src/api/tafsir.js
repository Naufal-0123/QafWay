import { get } from './client'

export const getTafsir = (nomor) => get(`/surahs/${nomor}/tafsir`)