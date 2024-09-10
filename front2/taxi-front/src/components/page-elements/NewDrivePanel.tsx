import React, {useEffect, useState} from 'react';
import IUser from '../interfaces/IUser';
import IToken from '../interfaces/IToken';
import IRide, {defaultRide} from '../interfaces/IRide';
import { estimateRide, confirmRide } from '../services/DriveService';
import IRideEstimate from '../interfaces/IRideEstimate';

interface NewRideProps{
    token: string;
}

const NewDrivePanel : React.FC<NewRideProps> = ({token}) => {
    const [rideModel, setRideModel] = useState<IRide>(defaultRide);
    const [rideEstimate, setRideEstimate] = useState<IRideEstimate | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const result = await estimateRide(rideModel, token);
            setRideEstimate(result);
        } catch (error) {
            console.error('Error estimating ride:', error);
        }
    };

    const handleChange=(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        key: keyof IRide
    ) => {
        setRideModel({
            ...rideModel,
            [key]: event.target.value,
        });
    };

    const handleConfirmRide = async () => {
        try {
            const result = await confirmRide(token);
        } catch(error) {

        }
    };

    return (
        <div>
            <h2 className='text-xl mb-4'>New Ride</h2>
            <form onSubmit={handleSubmit} className='mx-auto mb-4 mt-8 max-w-md space-y-4'>
                <div className='relative space-y-4'>
                    <label>
                        Starting Address
                    </label>
                    <div className='relative'>
                        <input type='text' autoFocus value={rideModel.startaddress} onChange={(e)=> handleChange(e, "startaddress")} className='w-full rounded-lg border-2 p-3' placeholder='Starting Address'/>
                    </div>
                    <label>
                        Destination Address
                    </label>
                    <div className='relative'>
                        <input type='text' value={rideModel.destaddress} onChange={(e)=>handleChange(e, "destaddress")} className='w-full rounded-lg border-2 p-3' placeholder='Destination Address'/>
                    </div>
                    <div className='flex items-center justify-between'>
                        <button type='submit' className='select-none rounded-lg p-3 bg-lime-600'>
                            Calculate Time and Price
                        </button>
                    </div>
                </div>
            </form>
            {rideEstimate && (
                <div className='mt-4'>
                    <h3 className='text-lg font-bold'>Ride Estimate</h3>
                    <p>Distance: {rideEstimate.distance.toFixed(2)} km</p>
                    <p>Travel Time: {rideEstimate.traveltime}</p>
                    <p>Price: {rideEstimate.price.toFixed(2)} din</p>
                    <div className='flex items-center justify-between'>
                        <button onClick={handleConfirmRide} className='select-none rounded-lg p-3 bg-lime-600'>
                            Confirm Ride
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewDrivePanel;