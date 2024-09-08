import axios, { AxiosResponse } from 'axios';
import { API_ADDRESS } from '../../App';
import IUser from '../interfaces/IUser';

export const getUserService = async (token:string): Promise<IUser | null> => {
    try {
        const response: AxiosResponse<IUser> = await axios.get(API_ADDRESS + "user/get-info", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.status === 200) {
            return response.data;
        } else {
            console.log(response);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
};

export default getUserService;