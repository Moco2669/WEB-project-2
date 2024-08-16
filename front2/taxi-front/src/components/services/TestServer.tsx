import axios, {AxiosResponse} from 'axios';
import React, { useEffect, useState } from 'react';
import { API_ADDRESS } from '../../App';
import { Link } from 'react-router-dom';

const TestServer = async () => {
    const response: AxiosResponse = await axios.get(API_ADDRESS + 'hello');
    if(response.status===200 || response.status === 204){
        return response.data;
    } else{
        return null;
    }
}

export default TestServer;