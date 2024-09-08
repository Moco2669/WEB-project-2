import React, {useEffect, useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import IUser from './interfaces/IUser';
import getUserService from './services/GetUserService';
import useAuth from './contexts/useAuth';
import Header from './Header';
import EditProfile from './page-elements/EditProfile';
import ProfileInfo from './page-elements/ProfileInfo';
import VerifyUsers from './page-elements/VerifyUsers';

const HomePage : React.FC = () =>{
    const {isLoggedIn, setToken, token} = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<IUser | null>(null);
    const [showProfile, setShowProfile] = useState<boolean>(false);
    const [showVerifyUsers, setShowVerifyUsers] = useState<boolean>(false);
    const [verifyStatus, setVerifyStatus] = useState<"Waiting" | "Verified" | "Rejected">("Waiting");

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/");
        } else {
            // Fetch user info
            fetchUserInfo();
        }
    }, [isLoggedIn, navigate]);

    const resetLeftScreen = () => {
        setShowProfile(false);
        setShowVerifyUsers(false);
    }

    const handleShowProfile = () => {
        resetLeftScreen();
        setShowProfile(true);
    };

    const handleShowVerifyUsers = () => {
        resetLeftScreen();
        setShowVerifyUsers(true);
    };

    const fetchUserInfo = async () => {
        const userInfo = await getUserService(token?.token ?? "");
        if (userInfo) {
            setUser(userInfo);
            await setVerifyStatus(userInfo.verifystatus);
            console.log(verifyStatus);
            console.log(userInfo);
        }
    };

    return(
        <div className='homepage-container'>
            <Header user={user} onShowProfile={handleShowProfile} />
            {verifyStatus==="Verified" && (
            <div className='flex justify-end mx-26 relative h-1/1'>
                <div className='w-3/4 p-4 bg-gray-100'>
                    <div className={`left-panel w-1/4 p-4 bg-gray-100`}>
                        {showProfile && <ProfileInfo user={user} />}
                        {showProfile && <EditProfile user={user} />}
                        {showVerifyUsers && <VerifyUsers token={token?.token ?? ""} />}
                    </div>
                </div>
                <div className='w-1/4 p-4'>
                    {user?.usertype === 'Admin' && (
                        <button onClick={handleShowVerifyUsers} className='select-none rounded-lg p-3 bg-lime-600 mb-4'>
                            Verify Users
                        </button>
                    )}
                </div>
            </div>
            )}
            {(verifyStatus==="Rejected" || verifyStatus==="Waiting") && (
                <div className='flex justify-end mx-26 relative h-1/1'>
                    Your Driver verification status is {verifyStatus}. Please contact admins for further information.
                </div>
            )}
        </div>
    );
}

export default HomePage;