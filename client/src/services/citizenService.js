 
import api from '../utils/api';

export const getAllCitizens = async () => {
  const response = await api.get('/citizens');
  return response.data;
};

export const getCitizen = async (id) => {
  const response = await api.get(`/citizens/${id}`);
  return response.data;
};

export const createCitizen = async (data) => {
  const response = await api.post('/citizens', data);
  return response.data;
};

export const updateCitizen = async (id, data) => {
  const response = await api.put(`/citizens/${id}`, data);
  return response.data;
};

export const deleteCitizen = async (id) => {
  const response = await api.delete(`/citizens/${id}`);
  return response.data;
};

export const importCitizens = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/citizens/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};