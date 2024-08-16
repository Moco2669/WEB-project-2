import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TestServer from './services/TestServer';
import ILogin, {defaultLogin} from './interfaces/ILogin';
import IToken from './interfaces/IToken';
import { AuthContext } from './contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import LoginService from './services/LoginService';

const LandingPage : React.FC = () =>{
    const [odzivServera, setOdziv] = useState('');
    const [loginModel, setLoginModel] = useState<ILogin>(defaultLogin);
    const { isLoggedIn, setToken, setEmail} = useContext(AuthContext);
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        if(isLoggedIn){
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    const handleChange=(
        event: React.ChangeEvent<HTMLInputElement>,
        key: keyof ILogin
    ) => {
        setLoginModel({
            ...loginModel,
            [key]: event.target.value,
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const error: string = ValidateLogin(loginModel);

        if(error.length > 0){
            setLoginError(error);
            return;
        }

        setLoginError('');
        const token: IToken | null = await LoginService(loginModel);
        if(token){
            setToken(token);
            localStorage.setItem("token", token.token ?? "");
            const decodedToken: IToken = jwtDecode(token.token ?? "");
            setEmail(decodedToken.email ?? "");

            navigate("/");
        } else {
            setLoginError("Wrong username or password! ");
        }
    };

    const ValidateLogin = (loginModel: ILogin): string => {
        var error: string = "";
        if(!loginModel.username.trim()){
            error += "Username field empty! ";
        } // doradi validaciju da nema spejsova
        if(loginModel.password.trim().length<8){
            error += "Password too short! ";
        }
        return error;
    };

    return(
    <div className='flex justify-end mx-26 relative mb-8'>
        <form onSubmit={handleSubmit} className='mx-auto mb-4 mt-8 max-w-md space-y-4 space-x-4'>
            <div className='relative space-y-4'>
                <label htmlFor='username' className='sr-only'>
                    Username
                </label>
                <div className='relative'>
                    <input type='text' autoFocus value={loginModel.username} onChange={(e)=> handleChange(e, "username")} className='w-full rounded-lg border-2 p-3' placeholder='Username'/>
                </div>
                <label htmlFor='password' className='sr-only'>
                    Password
                </label>
                <div className='relative'>
                    <input type='password' value={loginModel.password} onChange={(e)=>handleChange(e, "password")} className='w-full rounded-lg border-2 p-3' placeholder='Password'/>
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-gray-500'>No account? <a className='text-primary-600' href='/register'>Sign up</a></p>
                    <button type='submit' className='select-none rounded-lg p-3 bg-lime-600'>
                        Log in
                    </button>
                    {loginError && (
                        <p className='mt-4 text-primary-600 p-3'>{loginError}</p>
                    )}
                </div>
            </div>
        </form>
    </div>
    );
}

export default LandingPage;