import react, {useContext} from "react";
import axios, {AxiosResponse} from "axios";
import {useGoogleLogin} from '@react-oauth/google';
import IToken from "../interfaces/IToken";
import { API_ADDRESS } from "../../App";
import IRegister from "../interfaces/IRegister";
import { AuthContext } from "../contexts/AuthContext";

const GoogleSignInButton: React.FC = () => {
    const { setToken } = useContext(AuthContext);
    const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
        try {
        // Use the token to fetch user profile information
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
            },
        });

        const { email, given_name, family_name, picture } = userInfoResponse.data;

        // Fetch the image as a blob
        const imageResponse = await axios.get(picture, {
            responseType: 'blob',
        });

        // Convert the blob to a File object
        const imageFile = new File([imageResponse.data], 'profile.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
      formData.append('email', email);
      formData.append('username', email);
      formData.append('firstname', given_name);
      formData.append('lastname', family_name);
      formData.append('image', imageFile);
        formData.append('password', 'Password');
        formData.append('birthdate', new Date().toISOString());
        formData.append('address', 'Address');
      formData.append('usertype', "User");

        // Send the packed data to your regular registration endpoint
        const response = await axios.post(`${API_ADDRESS}user/register-google`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data', // Important for sending files
        },
        });
        if(response.status === 200 || response.status === 204){
            console.log({token:response.data.token});
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
        }
    } catch (error) {
        console.error('Google Sign In Failed:', error);
      }
    },
    onError: (error) => console.log('Google Sign In Failed:', error),
  });

  return (
    <button className='select-none rounded-lg p-3 bg-lime-600' onClick={() => googleLogin()}>
      Sign in via Google
    </button>
  );
};

export default GoogleSignInButton;