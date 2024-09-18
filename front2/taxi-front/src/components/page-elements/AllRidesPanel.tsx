import React, {useEffect, useState} from "react";
import useAuth from "../contexts/useAuth";
import IRideDetails from "../interfaces/IRideDetails";
import { getAllRides } from "../services/PreviousRidesService";

const AllRidesPanel: React.FC = () => {
    const [allRides, setAllRides] = useState<IRideDetails[]>([]);
    const{token} = useAuth();

    useEffect(() => {

        const fetchAllRides = async () => {
            if(token?.token){
                const rides = await getAllRides(token?.token);
                setAllRides(rides);
            }
        };

        fetchAllRides();
    }, [token?.token]);

    return(
        <div>
            <h2 className='text-xl mb-4'>All Rides</h2>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            User
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Driver
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
                        <th scope="col" className="px-6 py-3">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {allRides.map(ride => (
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 transition-colors">
                           <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {ride.user}
                            </th>
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {ride.driver}
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
                            <td className="px-6 py-4">
                                {ride.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AllRidesPanel;