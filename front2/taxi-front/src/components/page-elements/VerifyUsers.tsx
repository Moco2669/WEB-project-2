import React, { useEffect, useState } from 'react';
import { getUnverifiedUsersService, verifyUserService2, rejectUserService } from '../services/VerifyUserService';
import IUser from '../interfaces/IUser';
import IDriver from '../interfaces/IDriver';

interface VerifyUsersProps {
    token: string;
}

const VerifyUsers: React.FC<VerifyUsersProps> = ({ token }) => {
    const [unverifiedUsers, setUnverifiedUsers] = useState<IDriver[]>([]);

    const fetchUnverifiedUsers = async () => {
        const users = await getUnverifiedUsersService(token);
        setUnverifiedUsers(users);
    };

    useEffect(() => {
        fetchUnverifiedUsers();
        console.log(unverifiedUsers);
    }, [token]);

    const handleVerifyUser = async (username: string) => {
        await verifyUserService2(username, token);
        fetchUnverifiedUsers();
    };

    const handleRejectUser = async (username: string) => {
        await rejectUserService(username, token);
        fetchUnverifiedUsers();
    };

    return (
        <div>
            <h2 className='text-xl mb-4'>Verify Users</h2>
            <ul>
                {unverifiedUsers.map(user => (
                    <li key={user.username} className='flex justify-between items-center p-2 bg-white mb-2 rounded shadow'>
                        <span>{user.username}</span>
                        <span>{user.avgRating !== 0 && (user.avgRating)}</span>
                        <div>
                            {user.verifystatus != "Verified" && (
                                <button 
                                    className='bg-green-500 text-white p-2 rounded mr-2'
                                    onClick={() => handleVerifyUser(user.username)}
                                >
                                    Verify
                                </button>
                            )}
                            {user.verifystatus != "Rejected" && (               
                                <button 
                                    className='bg-red-500 text-white p-2 rounded'
                                    onClick={() => handleRejectUser(user.username)}
                                >
                                    Reject
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default VerifyUsers;