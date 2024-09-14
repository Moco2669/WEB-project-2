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
}