/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type.charAt(0).toUpperCase()} updated successfully`
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
