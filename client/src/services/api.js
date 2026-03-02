// Copy this file to: src/services/api.js in your doctor-appointment project

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const bookAppointment = (data) => API.post('/appointments', data);
export const getAppointments = () => API.get('/appointments');