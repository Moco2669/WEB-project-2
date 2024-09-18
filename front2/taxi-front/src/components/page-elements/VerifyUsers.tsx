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
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                User
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Average Rating
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {unverifiedUsers.map(user => (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 transition-colors">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {user.username}
                                </th>
                                <td className="px-6 py-4">
                                    {user.avgRating !== 0 && (user.avgRating)}
                                </td>
                                <td className="flex px-6 py-4 justify-end">
                                    {user.verifystatus != "Verified" && (
                                        <button
                                            className='bg-green-500 text-white p-2 rounded mr-2 w-1/2 hover:bg-green-700 transition-colors'
                                            onClick={() => handleVerifyUser(user.username)}
                                        >
                                            Verify
                                        </button>
                                    )}
                                    {user.verifystatus != "Rejected" && (
                                        <button
                                            className='bg-red-500 text-white p-2 rounded w-1/2 hover:bg-red-700 transition-colors'
                                            onClick={() => handleRejectUser(user.username)}
                                        >
                                            Reject
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default VerifyUsers;