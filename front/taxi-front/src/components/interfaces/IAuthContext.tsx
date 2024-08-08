import IToken from "./IToken";

interface IAuthContext{
    token: IToken | null;
    email: string | null;
    setToken: (token: IToken | null) => void;
    setEmail: (email: string) => void;
    isLoggedIn: boolean;
    isTokenValid: boolean;
}

export default IAuthContext;