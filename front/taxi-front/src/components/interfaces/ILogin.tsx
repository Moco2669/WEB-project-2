interface ILogin{
    email:string;
    password:string;
}
export default ILogin;
const defaultLogin: ILogin={
    email:"",
    password:""
};
export {defaultLogin};