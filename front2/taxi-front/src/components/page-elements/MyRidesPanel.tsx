import React, {useEffect, useState} from "react";
import useAuth from "../contexts/useAuth";
import IRideDetails from "../interfaces/IRideDetails";
import { getMyRides } from "../services/PreviousRidesService";

const MyRidesPanel: React.FC = () => {
    const [myRides, setMyRides] = useState<IRideDetails[]>([]);
    const {token} = useAuth();

    useEffect(() => {

        const fetchMyRides = async () => {
            if(token?.token){
                const rides = await getMyRides(token?.token);
                setMyRides(rides);
            }
        };

        fetchMyRides();
    }, [token?.token]);
    return(
        <div className="w-full">
        <h2 className='text-xl mb-4'>My Rides</h2>
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                User
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Start Address
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Destination Address
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Price
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Distance
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Rating
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {myRides.map(ride => (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 transition-colors">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {ride.user}
                                </th>
                                <td className="px-6 py-4">
                                    {ride.startaddress}
                                </td>
                                <td className="px-6 py-4">
                                    {ride.destaddress}
                                </td>
                                <td className="px-6 py-4">
                                    {ride.price}
                                </td>
                                <td className="px-6 py-4">
                                    {ride.distance}
                                </td>
                                <td className="px-6 py-4">
                                    {ride.rating}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

    </div>
    );
};

export default MyRidesPanel;