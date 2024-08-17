import axios, {AxiosResponse} from "axios";
import IToken from "../interfaces/IToken";
import { API_ADDRESS } from "../../App";
import IRegister from "../interfaces/IRegister";

const GoogleSignInService = async (): Promise<IToken | string> =>{
    try{
        const response: AxiosResponse = await axios.get(
            API_ADDRESS + 'user/google-register', {withCredentials: true});
        window.location.href=response.data.url;
        if(response.status === 200 || response.status ===204){
            return {token:response.data.token};
        }
        return "Error";
        //window.location.href = API_ADDRESS+'user/google-register';

        return "";
    } catch {
        return "A strange error occured during register";
    }
}; 
/*
const GoogleSignInService = async (): Promise<IToken | string> => {
    try {
        const popup = openPopup(`${API_ADDRESS}user/google-register`);

        if (!popup) {
            throw new Error("Failed to open popup.");
        }

        const token = await new Promise<string>((resolve, reject) => {
            const intervalId = setInterval(() => {
                if (popup.closed) {
                    clearInterval(intervalId);
                    window.removeEventListener('message', messageHandler);
                    reject("Popup closed before receiving a token.");
                }
            }, 1000);

            const messageHandler = (event: MessageEvent) => {
                console.log('Message event received:', event);
                if (event.origin === API_ADDRESS+'User/google-response') {
                    if (event.data.token) {
                        clearInterval(intervalId);
                        resolve(event.data.token);
                    } else {
                        reject("Invalid token received.");
                    }
                } else{
                    console.warn("Message from unexpected origin:", event.origin); // Debugging line
                }
            };

            window.addEventListener('message', messageHandler);
        });

        return { token };
    } catch (error) {
        return `A strange error occurred during Google Sign-In: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};


const openPopup = (url:string): Window | null => {
    return window.open(
        url,
        'GoogleSignIn',
        'width=500,height=600,left=100,top=100'
    );
};

/*const handleGoogleSignIn = () => {
    const popup = openPopup(API_ADDRESS+'user/google-register');

    const checkPopupClosed = setInterval(() => {
        if(popup!=null){
            if (popup.closed) {
                clearInterval(checkPopupClosed);
                window.addEventListener('message', (event) => {
                    if (event.origin === 'http://localhost:8655') {
                        const token = event.data.token;
                        console.log('Token received:', token);
                        return {token:token};
                    }
                });
                console.log('Popup closed');
            }
        } 
    }, 1000);
};*/

const handleGoogleSignIn = async () => {
    const result = await GoogleSignInService();
    if (typeof result === 'string') {
        console.error(result);
    } else {
        console.log('Token received:', result.token);
        // Do something with the token
    }
};

export default handleGoogleSignIn;