interface IRide {
    startaddress:string;
    destaddress:string;
}

export default IRide;

const defaultRide: IRide = {
    startaddress:"",
    destaddress:"",
};

export {defaultRide}