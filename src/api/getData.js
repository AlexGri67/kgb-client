import axios from 'axios';
import debounce from 'debounce';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const DEBOUNCE = 1000;

const { CancelToken } = axios;
let cancel;

export const getData = async (page, size, filters, setData, setTotalPages, setLoading) => {
  if (cancel !== undefined) {
    cancel("Operation canceled due to new request.");
  }

  try {
    setLoading(true);
    const params = { page: page, size: size, filters };
    const result = await axios.get(`${apiUrl}/messages`, {
      params,
      cancelToken: new CancelToken(function executor(c) {
        cancel = c;
      })
    });
    setData(result.data.data);
    setTotalPages(result.data.totalPages);
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    } else {
      console.error('Failed to fetch data:', error);
    }
  }
  setLoading(false);
}

export const getDataWithDebounce = debounce(getData, DEBOUNCE);