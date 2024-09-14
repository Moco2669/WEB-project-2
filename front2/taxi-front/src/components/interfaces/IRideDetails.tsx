import IRideEstimate from "./IRideEstimate";

interface IRideDetails extends IRideEstimate {
    starttime:string;
    driverarrivetime:string;
    //traveltime:TimeRanges;
    arrivetime:string;
    driver:string;
};

export default IRideDetails;