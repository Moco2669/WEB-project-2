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
import PreviousRidesPanel from './page-elements/PreviousRidesPanel';
import MyRidesPanel from './page-elements/MyRidesPanel';
import AllRidesPanel from './page-elements/AllRidesPanel';

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
        setShowMyDrives(true);
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
        setShowNewDrives(true);
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
            <div className='flex flex-grow justify-end mx-26 relative bg-gray-100 w-full'>
                <div className='w-3/4 p-4 bg-gray-100 max-h-screen overflow-auto'>
                    <div className={`left-panel w-full p-4 bg-gray-100 items-center`}>
                        {showProfile && <ProfileInfo user={user} />}
                        {showProfile && user && <EditProfile user={user} />}
                        {showVerifyUsers && <VerifyUsers token={token?.token ?? ""} />}
                        {showNewDrive && <NewDrivePanel/>}
                        {showNewDrives && <NewRidesPanel/>}
                        {showPreviousDrives && <PreviousRidesPanel/>}
                        {showMyDrives && <MyRidesPanel/>}
                        {showAllDrives && <AllRidesPanel/>}
                    </div>
                </div>
                <div className='w-1/4 p-4 flex flex-col space-y-4'>
                    {user?.usertype === 'Admin' && (
                        <div className='flex flex-col space-y-4'>
                            <button onClick={handleShowVerifyUsers} className='select-none rounded-lg p-3 bg-green-500 mb-4 hover:bg-green-700 transition-colors'>
                                Verify Users
                            </button>
                            <button onClick={handleShowAllDrives} className='select-none rounded-lg p-3 bg-green-500 mb-4 hover:bg-green-700 transition-colors'>
                                View All Drives
                            </button>
                        </div>
                    )}
                    {user?.usertype === 'User' && (
                        <div className='flex flex-col space-y-4'>
                            <button onClick={handleShowNewDrive} className='select-none rounded-lg p-3 bg-green-500 mb-4 hover:bg-green-700 transition-colors'>
                                New Drive
                            </button>
                            <button onClick={handleShowPreviousDrives} className='select-none rounded-lg p-3 bg-green-500 mb-4 hover:bg-green-700 transition-colors'>
                                Previous Drives
                            </button>
                        </div>
                    )}
                    {user?.usertype === 'Driver' && (
                        <div className='flex flex-col space-y-4'>
                            <button onClick={handleShowNewDrives} className='select-none rounded-lg p-3 bg-green-500 mb-4 hover:bg-green-700 transition-colors'>
                                New Drives
                            </button>
                            <button onClick={handleShowMyDrives} className='select-none rounded-lg p-3 bg-green-500 mb-4 hover:bg-green-700 transition-colors'>
                                My Drives
                            </button>
                        </div>
                    )}
                </div>
            </div>
            )}
            {(verifyStatus==="Rejected" || verifyStatus==="Waiting") && (
                <div className='flex mx-26 relative h-full bg-gray-100'>
                    Your Driver verification status is {verifyStatus}. Please contact admins for further information.
                </div>
            )}
        </div>
    );
}

export default HomePage;