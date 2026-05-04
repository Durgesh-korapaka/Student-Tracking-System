import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000/api' });

export const getAllStudents = () => API.get('/students');
export const getStudentById = (id) => API.get(`/students/${id}`);
export const createStudent = (data) => API.post('/students/validate', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);
export const bulkInsert = (data) => API.post('/students/bulk', data);
export const enrollStudent = (data) => API.post('/students/enroll', data);
export const getDashboard = () => API.get('/students/dashboard/stats');