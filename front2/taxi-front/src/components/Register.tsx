import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ILogin, {defaultLogin} from './interfaces/ILogin';
import IToken from './interfaces/IToken';
import { AuthContext } from './contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import IRegister, { defaultRegister } from './interfaces/IRegister';
import RegisterService from './services/RegisterService';

const Register : React.FC = () => {
    const [registerModel, setRegisterModel] = useState<IRegister>(defaultRegister);
    const [registerError, setRegisterError] = useState('');
    const navigate = useNavigate();
    const {isLoggedIn, setToken} = useContext(AuthContext);
    const [confirmPass, setConfirmPass] = useState('');

    useEffect(() => {
        if(isLoggedIn){
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setRegisterModel({
                ...registerModel,
                image: event.target.files[0]
            });
            console.log(event.target.files[0]);
        }
    };

    const handleChange=(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        key: keyof IRegister
    ) => {
        setRegisterModel({
            ...registerModel,
            [key]: key === 'birthdate' ? new Date(event.target.value) : event.target.value,
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const error: string = ValidateRegister(registerModel);

        if(error.length > 0){
            setRegisterError(error);
            return;
        }

        setRegisterError('');
        const result: IToken | string = await RegisterService(registerModel);
        if(typeof result === "object"){
            setToken(result);
            localStorage.setItem("token", result.token ?? "");
        } else {
            setRegisterError("Register error: "+ result);
        }
    };

    const ValidateRegister = (registerModel: IRegister): string => {
        var errors: string = '';
        if (!registerModel.email.includes('@')) errors+= "Invalid email address! ";
        if (registerModel.password.length < 8) errors+="Password must be at least 8 characters! ";
        if (registerModel.password !== confirmPass) errors+="Passwords don't match!";
        if (!registerModel.username) errors+="Username is required! ";
        if (!registerModel.firstname) errors+="First name is required! ";
        if (!registerModel.lastname) errors+="Last name is required! ";
        if (!registerModel.address) errors+="Address is required! ";
        if (!registerModel.usertype) errors+="User type is required! ";
        if (!registerModel.image) errors+="User image is required! ";
        return errors;
    };

    return(
        <div className='flex justify-end mx-26 relative mb-8'>
            <form onSubmit={handleSubmit} className='mx-auto mb-4 mt-8 max-w-md space-y-4'>
                <div className='relative space-y-4'>
                    <label htmlFor='email' className='sr-only'>
                        Email
                    </label>
                    <div className='relative'>
                        <input type='email' autoFocus value={registerModel.email} onChange={(e)=> handleChange(e, "email")} className='w-full rounded-lg border-2 p-3' placeholder='Email'/>
                    </div>
                    <label htmlFor='password' className='sr-only'>
                        Password
                    </label>
                    <div className='relative'>
                        <input type='password' value={registerModel.password} onChange={(e)=>handleChange(e, "password")} className='w-full rounded-lg border-2 p-3' placeholder='Password'/>
                    </div>
                    <div className='relative'>
                        <input type='password' value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className='w-full rounded-lg border-2 p-3' placeholder='Confirm Password'/>
                    </div>
                    <div className='relative'>
                        <input type='text' value={registerModel.username} onChange={(e)=>handleChange(e, "username")} className='w-full rounded-lg border-2 p-3' placeholder='Username'/>
                    </div>
                    <div className='relative'>
                        <input type='text' value={registerModel.firstname} onChange={(e)=>handleChange(e, "firstname")} className='w-full rounded-lg border-2 p-3' placeholder='First Name'/>
                    </div>
                    <div className='relative'>
                        <input type='text' value={registerModel.lastname} onChange={(e)=>handleChange(e, "lastname")} className='w-full rounded-lg border-2 p-3' placeholder='Last Name'/>
                    </div>
                    <div className='relative'>
                        <input type='date' value={registerModel.birthdate.toISOString().substring(0, 10)} onChange={(e)=>handleChange(e, "birthdate")} className='w-full rounded-lg border-2 p-3' placeholder='Birthdate'/>
                    </div>
                    <div className='relative'>
                        <input type='text' value={registerModel.address} onChange={(e)=>handleChange(e, "address")} className='w-full rounded-lg border-2 p-3' placeholder='Address'/>
                    </div>
                    <div className='relative'>
                        <input type='file' accept='image/*' onChange={(e) => handleImageChange(e)} className='w-full rounded-lg border-2 p-3' />
                    </div>
                    <div className='relative'>
                        <select value={registerModel.usertype} onChange={(e)=>handleChange(e, "usertype")} className='w-full rounded-lg border-2 p-3'>
                            <option value="Admin">Admin</option>
                            <option value="Driver">Driver</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                    <div className='flex items-center justify-between'>
                        <button type='submit' className='select-none rounded-lg p-3 bg-lime-600'>
                            Register
                        </button>
                        {registerError && (
                            <p className='mt-4 text-primary-600 p-3'>{registerError}</p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Register;