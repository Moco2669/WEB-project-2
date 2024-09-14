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
    }, [token]);

    return(
        <div>
            <h2 className='text-xl mb-4'>Previous Rides</h2>
            <ul>
                {previousRides.map(ride => (
                    <li className='flex justify-between items-center p-2 bg-white mb-2 rounded shadow'>
                        <span>{ride.driver}</span>
                        <span>{ride.startaddress}</span>
                        <span>{ride.destaddress}</span>
                        <span>{ride.price}</span>
                        <span>{ride.distance}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PreviousRidesPanel;