import React from "react";
import axios from "axios";
import { API_ADDRESS } from "../../App";

export const getPreviousRides = async (token:string) => {
    const response = await axios.get(API_ADDRESS + 'ride/previous', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const getMyRides = async (token:string) =>{
    const response = await axios.get(API_ADDRESS + 'ride/driver-previous', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const getAllRides = async (token:string) => {
    const response = await axios.get(API_ADDRESS + 'ride/all', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};