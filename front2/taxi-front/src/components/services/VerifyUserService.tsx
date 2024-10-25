import axios from 'axios';
import { API_ADDRESS } from '../../App';

export const getUnverifiedUsersService = async (token: string) => {
    const response = await axios.get(API_ADDRESS + 'user/get-waiting-users', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log(response.data);
    return response.data;
};

export const verifyUserService = async (username: string, token: string) => {
    const response = await axios.put(API_ADDRESS + 'user/validate-user/${username}', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log(response.data);
};

export const verifyUserService2 = async (username: string, token: string) => {
    const response = await axios.put(API_ADDRESS + `user/validate-user-new`, {username:username}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log(response.data);
};

export const rejectUserService = async (username: string, token: string) => {
    await axios.put(API_ADDRESS + 'user/reject', {username:username}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};