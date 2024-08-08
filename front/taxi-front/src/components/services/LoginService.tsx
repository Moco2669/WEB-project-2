import axios, { AxiosResponse } from "axios";
import { API_ADDRESS } from "../../App";
import ILogin from "../interfaces/ILogin";
import IToken from "../interfaces/IToken";

const LoginService = async(credentials: ILogin): Promise<IToken | null> =>{
    try{
        const response: AxiosResponse<IToken> = await axios.post(API_ADDRESS + "auth/login", credentials);

        if(response.status === 200){
            return {token:response.data.token};
        } else{
            return null;
        }
    } catch {
        return null;
    }
};

export default LoginService;