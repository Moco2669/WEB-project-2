import React from "react";
import axios from "axios";
import IUser from "../interfaces/IUser";
import { API_ADDRESS } from "../../App";

const EditService = async (user: IUser, token: string) => {
    try{
        const formData = new FormData();
        formData.append('email', user.email);
        formData.append('password', user.password);
        formData.append('firstname', user.firstname);
        formData.append('lastname', user.lastname);
        formData.append('birthdate', user.birthdate.toISOString());
        formData.append('address', user.address);
        if(user.image){
            formData.append('image', user.image);
            console.log(user.image);
        }
        const response = await axios.post(API_ADDRESS + 'user/edit', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response);
        if(response.status === 200){
            return "success";
        }
    }
    catch(error){
        return error;
    }
};

export default EditService;