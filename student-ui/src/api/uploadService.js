import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:3000/api' });

export const uploadFile = (studentId, formData) =>
  API.post(`/upload/${studentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getStudentFiles = (studentId) =>
  API.get(`/upload/${studentId}`);