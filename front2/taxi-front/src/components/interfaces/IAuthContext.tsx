import IToken from "./IToken";

interface IAuthContext{
    token: IToken | null;
    setToken: (token: IToken | null) => void;
    isLoggedIn: boolean;
}

export default IAuthContext;