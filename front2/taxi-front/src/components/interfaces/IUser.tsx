import IRegister from "./IRegister";

interface IUser extends IRegister{
    verifystatus: "Waiting" | "Verified" | "Rejected";
    imagebase64: File | null;
}

export default IUser;