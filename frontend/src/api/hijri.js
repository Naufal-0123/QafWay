import { get } from './client'

export const getToday = () => get('/hijri/today')
export const getCalendar = (year, month) => get('/hijri/calendar', { year, month })