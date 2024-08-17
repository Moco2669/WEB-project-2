import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
//import { useHistory } from 'react-router-dom';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const { isLoggedIn, setToken, setEmail} = useContext(AuthContext);
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            setToken(token);
            localStorage.setItem("token", token.token ?? "");
            const decodedToken: IToken = jwtDecode(token.token ?? "");
            setEmail(decodedToken.email ?? "");
            navigate('/register');
        } else {
            navigate('/login');
        }
    }, [history]);

    return <div>Loading...</div>;
};

export default GoogleCallback;