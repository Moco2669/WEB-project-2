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

    useEffect(() => {
        const fetch = async () => {
            let response = await TestServer();
            if(response){
                setOdziv(response);
            }
        };
        fetch();
    })

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
        // fali provera
        const token: IToken | null = await LoginService(loginModel);
        if(token){
            setToken(token);
            localStorage.setItem("token", token.token ?? "");
            const decodedToken: IToken = jwtDecode(token.token ?? "");
            setEmail(decodedToken.email ?? "");

            navigate("/");
        } else {
            //fali greska
        }
    }

    return(
    <div className='flex justify-end mx-48 relative mb-8'>
        <form onSubmit={handleSubmit} className='mx-auto mb-0 mt-8 max-w-md space-y-4'>
            <div className='relative'>
                <label htmlFor='email' className='sr-only'>
                    Email
                </label>
                <div className='relative'>
                    <input type='email' autoFocus value={loginModel.email} onChange={(e)=> handleChange(e, "email")} className='w-full rounded-lg border-2' placeholder='Email'/>
                </div>
                <label htmlFor='password' className='sr-only'>
                    Password
                </label>
                <div className='relative'>
                    <input type='password' value={loginModel.password} onChange={(e)=>handleChange(e, "password")} className='w-full rounded-lg border-2' placeholder='Password'/>
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-gray-500'>No account? <a className='text-primary-600' href='/register'>Sign up</a></p>
                </div>
                <button type='submit' className='select-none rounded-lg'>
                    Log in
                </button>
            </div>
        </form>
    <p>Ovo je dobijeno od strane servera: </p>
    </div>
    );
}

export default LandingPage;