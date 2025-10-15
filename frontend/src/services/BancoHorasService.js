import api from '../axios';

export async function getDashboardData() {
  const { data } = await api.get('/bancohoras/dashboard/me');
  return data;
}

export default { getDashboardData };
