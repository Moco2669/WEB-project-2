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
import NewDrivePanel from './page-elements/NewDrivePanel';
import NewRidesPanel from './page-elements/NewRidesPanel';

const HomePage : React.FC = () =>{
    const {isLoggedIn, setToken, token} = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<IUser | null>(null);
    const [showProfile, setShowProfile] = useState<boolean>(false);
    const [showVerifyUsers, setShowVerifyUsers] = useState<boolean>(false);
    const [showNewDrive, setShowNewDrive] = useState<boolean>(false);
    const [showNewDrives, setShowNewDrives] = useState<boolean>(false);
    const [showMyDrives, setShowMyDrives] = useState<boolean>(false);
    const [showAllDrives, setShowAllDrives] = useState<boolean>(false);
    const [showPreviousDrives, setShowPreviousDrives] = useState<boolean>(false);
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
        setShowNewDrive(false);
        setShowMyDrives(false);
        setShowAllDrives(false);
        setShowNewDrives(false);
        setShowPreviousDrives(false);
    }

    const handleShowProfile = () => {
        resetLeftScreen();
        setShowProfile(true);
    };

    const handleShowAllDrives = () =>{
        resetLeftScreen();
        setShowAllDrives(true);
    };

    const handleShowMyDrives = () => {
        resetLeftScreen();
        setShowAllDrives(true);
    };

    const handleShowNewDrive = () => {
        resetLeftScreen();
        setShowNewDrive(true);
    };

    const handleShowPreviousDrives = () => {
        resetLeftScreen();
        setShowPreviousDrives(true);
    };

    const handleShowNewDrives = () => {
        resetLeftScreen();
        setShowNewDrive(true);
    }

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
        <div className='homepage-container min-h-screen flex flex-col'>
            <Header user={user} onShowProfile={handleShowProfile} />
            {verifyStatus==="Verified" && (
            <div className='flex flex-grow justify-end mx-26 relative bg-gray-100'>
                <div className='w-3/4 p-4 bg-gray-100'>
                    <div className={`left-panel w-1/4 p-4 bg-gray-100`}>
                        {showProfile && <ProfileInfo user={user} />}
                        {showProfile && <EditProfile user={user} />}
                        {showVerifyUsers && <VerifyUsers token={token?.token ?? ""} />}
                        {showNewDrive && <NewDrivePanel token={token?.token ?? ""}/>}
                        {showNewDrives && <NewRidesPanel token={token?.token?? ""}/>}
                    </div>
                </div>
                <div className='w-1/4 p-4 flex flex-col space-y-4'>
                    {user?.usertype === 'Admin' && (
                        <div className='flex flex-col space-y-4'>
                            <button onClick={handleShowVerifyUsers} className='select-none rounded-lg p-3 bg-lime-600 mb-4'>
                                Verify Users
                            </button>
                            <button onClick={handleShowAllDrives} className='select-none rounded-lg p-3 bg-lime-600 mb-4'>
                                View All Drives
                            </button>
                        </div>
                    )}
                    {user?.usertype === 'User' && (
                        <div className='flex flex-col space-y-4'>
                            <button onClick={handleShowNewDrive} className='select-none rounded-lg p-3 bg-lime-600 mb-4'>
                                New Drive
                            </button>
                            <button onClick={handleShowPreviousDrives} className='select-none rounded-lg p-3 bg-lime-600 mb-4'>
                                Previous Drives
                            </button>
                        </div>
                    )}
                    {user?.usertype === 'Driver' && (
                        <div className='flex flex-col space-y-4'>
                            <button onClick={handleShowNewDrives} className='select-none rounded-lg p-3 bg-lime-600 mb-4'>
                                New Drives
                            </button>
                            <button onClick={handleShowMyDrives} className='select-none rounded-lg p-3 bg-lime-600 mb-4'>
                                My Drives
                            </button>
                        </div>
                    )}
                </div>
            </div>
            )}
            {(verifyStatus==="Rejected" || verifyStatus==="Waiting") && (
                <div className='flex justify-end mx-26 relative h-full bg-gray-100'>
                    Your Driver verification status is {verifyStatus}. Please contact admins for further information.
                </div>
            )}
        </div>
    );
}

export default HomePage;