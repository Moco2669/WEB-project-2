import axios, {AxiosResponse} from "axios";
import IToken from "../interfaces/IToken";
import { API_ADDRESS } from "../../App";
import IRegister from "../interfaces/IRegister";

const RegisterService = async (user: IRegister): Promise<IToken | string> =>{
    try{
        const formData = new FormData();
        formData.append('email', user.email);
        formData.append('password', user.password);
        formData.append('username', user.username);
        formData.append('firstname', user.firstname);
        formData.append('lastname', user.lastname);
        formData.append('birthdate', user.birthdate.toISOString());
        formData.append('address', user.address);
        formData.append('usertype', user.usertype);
        if(user.image){
            formData.append('image', user.image);
            console.log(user.image);
        }
        const response: AxiosResponse = await axios.post(
            API_ADDRESS + 'user/register', formData);
        if(response.status === 200 || response.status ===204){
            return {token:response.data.token};
        }
        return "Error";
    } catch {
        return "A strange error occured during register";
    }
};

export default RegisterService;