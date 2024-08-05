import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TestServer from './functions/TestServer';

const LandingPage : React.FC = () =>{
    const [odzivServera, setOdziv] = useState('');

    useEffect(() => {
        const fetch = async () => {
            let response = await TestServer();
            if(response){
                setOdziv(response);
            }
        };
        fetch();
    })

    return(<div>
    <p>Ovo je dobijeno od strane servera: </p>
    </div>);
}

export default LandingPage;