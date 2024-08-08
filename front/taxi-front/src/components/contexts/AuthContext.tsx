import { createContext, useEffect, useState, useMemo } from "react";
import IToken from "../interfaces/IToken";
import {jwtDecode} from "jwt-decode";
import IAuthContext from "../interfaces/IAuthContext";

export const AuthContext = createContext<IAuthContext>({
    token:null,
    email:"",
    setToken:()=>{},
    setEmail:()=>{},
    isLoggedIn:false,
    isTokenValid:false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode}> = ({
    children,
}) => {
    const [token, setToken] = useState<IToken | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(()=>{
        const storedToken = localStorage.getItem("token");
        if(storedToken){
            setToken({token:storedToken});

            const decodedToken: IToken = jwtDecode(storedToken);
            setEmail(decodedToken.email ?? "");
        }
    }, []);

    const isLoggedIn = !!token;

    const isTokenValid = useMemo(() => {
        if(!token) return false;

        const decodedToken:{exp:number} = jwtDecode(token.token ?? "");
        const currentTime = Date.now() / 1000;

        if(decodedToken.exp <= currentTime){
            localStorage.removeItem("token");
            setToken(null);
            setEmail("");
            return false;
        }
        return true;
    }, [token]);

    return(
        <AuthContext.Provider value={{token, email, setToken, setEmail, isLoggedIn, isTokenValid}}>
            {children}
        </AuthContext.Provider>
    )
}