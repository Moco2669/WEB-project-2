import axios from "axios";
import { API_ADDRESS } from "../../App";
import IRide from "../interfaces/IRide";
import IRideEstimate from "../interfaces/IRideEstimate";

export const estimateRide = async (ride: IRide, token: string): Promise<IRideEstimate | null> => {
    const response = await axios.post(API_ADDRESS + 'ride/estimate', ride, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log(response.data);
    return response.data;
};

export const confirmRide = async (token:string) => {
    const response = await axios.get(API_ADDRESS + 'ride/confirm', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const getNewRides = async (token:string) => {
    const response = await axios.get(API_ADDRESS + 'ride/get-waiting', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};