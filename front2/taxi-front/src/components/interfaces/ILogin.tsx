interface ILogin{
    username:string;
    password:string;
}
export default ILogin;
const defaultLogin: ILogin={
    username:"",
    password:""
};
export {defaultLogin};