import { createContext, useEffect, useState, useMemo } from "react";
import IToken from "../interfaces/IToken";
import {jwtDecode} from "jwt-decode";
import IAuthContext from "../interfaces/IAuthContext";

export const AuthContext = createContext<IAuthContext>({
    token:null,
    setToken:()=>{},
    isLoggedIn:false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode}> = ({
    children,
}) => {
    const [token, setToken] = useState<IToken | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(()=>{
        const storedToken = localStorage.getItem("token");
        if(storedToken === undefined){
            setIsLoggedIn(false);
            setToken(null);
        }
        if(storedToken){
            setToken({token:storedToken});
        }
    }, []);

    useEffect(()=>{
        if(token!=null && token.token != null){
            localStorage.setItem("token", token.token);
        } else {
            localStorage.removeItem("token");
        }
        console.log("USE EFFECT CONSOLE LOG " + token);
        setIsLoggedIn(!!token);
    }, [token]);

    return(
        <AuthContext.Provider value={{token, setToken, isLoggedIn}}>
            {children}
        </AuthContext.Provider>
    )
}