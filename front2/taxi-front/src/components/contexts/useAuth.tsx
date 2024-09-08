import IAuthContext from "../interfaces/IAuthContext";
import react, {useContext} from 'react';
import { AuthContext } from "./AuthContext";

const useAuth = (): IAuthContext => useContext(AuthContext);

export default useAuth;