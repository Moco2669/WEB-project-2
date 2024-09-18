import React, {useEffect, useState} from "react";
import useAuth from "../contexts/useAuth";
import { getPreviousRides } from "../services/PreviousRidesService";
import IRideDetails from "../interfaces/IRideDetails";

const PreviousRidesPanel: React.FC = () => {
    const [previousRides, setPreviousRides] = useState<IRideDetails[]>([]);
    const {token} = useAuth();

    useEffect(() => {

        const fetchPreviousRides = async () => {
            if(token?.token){
                const rides = await getPreviousRides(token?.token);
                setPreviousRides(rides);
            }
        };

        fetchPreviousRides();
        //console.log(previousRides);
    }, [token?.token]);

    return(
        <div>
            <h2 className='text-xl mb-4'>Previous Rides</h2>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
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
                    </tr>
                </thead>
                <tbody>
                    {previousRides.map(ride => (
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 transition-colors">
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PreviousRidesPanel;