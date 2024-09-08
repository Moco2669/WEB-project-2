import React, { useEffect, useState } from 'react';
import { getUnverifiedUsersService, verifyUserService, rejectUserService } from '../services/VerifyUserService';
import IUser from '../interfaces/IUser';

interface VerifyUsersProps {
    token: string;
}

const VerifyUsers: React.FC<VerifyUsersProps> = ({ token }) => {
    const [unverifiedUsers, setUnverifiedUsers] = useState<IUser[]>([]);

    useEffect(() => {
        // Fetch the unverified users when the component loads
        const fetchUnverifiedUsers = async () => {
            const users = await getUnverifiedUsersService(token);
            setUnverifiedUsers(users);
        };

        fetchUnverifiedUsers();
        console.log(unverifiedUsers);
    }, [token]);

    const handleVerifyUser = async (username: string) => {
        await verifyUserService(username, token);
        // Optionally refetch the list after verification
        setUnverifiedUsers(unverifiedUsers.filter(user => user.username !== username));
    };

    const handleRejectUser = async (username: string) => {
        await rejectUserService(username, token);
        // Optionally refetch the list after rejection
        setUnverifiedUsers(unverifiedUsers.filter(user => user.username !== username));
    };

    return (
        <div>
            <h2 className='text-xl mb-4'>Unverified Users</h2>
            <ul>
                {unverifiedUsers.map(user => (
                    <li key={user.username} className='flex justify-between items-center p-2 bg-white mb-2 rounded shadow'>
                        <span>{user.username}</span>
                        <div>
                            <button 
                                className='bg-green-500 text-white p-2 rounded mr-2'
                                onClick={() => handleVerifyUser(user.username)}
                            >
                                Verify
                            </button>
                            <button 
                                className='bg-red-500 text-white p-2 rounded'
                                onClick={() => handleRejectUser(user.username)}
                            >
                                Reject
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default VerifyUsers;