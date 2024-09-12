import IRideEstimate from "./IRideEstimate";

interface IWaitingRide extends IRideEstimate{
    user:string;
    driver:string;
};

export default IWaitingRide