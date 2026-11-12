import { get } from './client'

export const getDoaList = (params = {}) => get('/doa', params)
export const getDoa = (id) => get(`/doa/${id}`)