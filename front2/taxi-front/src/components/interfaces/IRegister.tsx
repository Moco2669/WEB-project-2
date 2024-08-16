interface IRegister{
    email:string;
    password:string;
    username:string;
    firstname:string;
    lastname:string;
    birthdate:Date;
    address:string;
    image: File | null;
    usertype: "Admin" | "Driver" | "User";
}
export default IRegister;
const defaultRegister: IRegister={
    email:"",
    password:"",
    username:"",
    firstname:"",
    lastname:"",
    birthdate:new Date("2000-01-01"),
    address:"",
    image:null,
    usertype: "User"
};
export {defaultRegister};