import React, { useEffect, useState } from 'react';
import IUser from '../interfaces/IUser';
import IRegister, { defaultRegister } from '../interfaces/IRegister';
import { useNavigate } from 'react-router-dom';
import EditService from '../services/EditService';
import useAuth from '../contexts/useAuth';

interface EditProfileProps {
  user: IUser;
}

const EditProfile: React.FC<EditProfileProps> = ({ user }) => {
  const [confirmPass, setConfirmPass] = useState('');
  const [editError, setEditError] = useState('');
  const navigate = useNavigate();
  const {token} = useAuth();
  const [editModel, setEditModel] = useState<IUser>({
    ...user,
    birthdate: user.birthdate ? new Date(user.birthdate) : new Date()
  });

  useEffect(()=>{
    setEditModel({
      ...editModel,
      password: ""
    });
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const error = ValidateEdit(editModel);

    if(error.length > 0){
        setEditError(error);
        return;
    }

    setEditError('');
    if(token?.token){
      const result = await EditService(editModel, token?.token);
      if(result === "success"){
          navigate("/");
      } else {
          setEditError("Edit error: "+ result);
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        setEditModel({
            ...editModel,
            image: event.target.files[0]
        });
        console.log(event.target.files[0]);
    }
};
  
const ValidateEdit = (editModel: IUser): string => {
  var errors: string = '';
  if (!editModel.email.includes('@')) errors+= "Invalid email address! ";
  if (editModel.password.length < 8) errors+="Password must be at least 8 characters! ";
  if (editModel.password !== confirmPass) errors+="Passwords don't match!";
  if (!editModel.firstname) errors+="First name is required! ";
  if (!editModel.lastname) errors+="Last name is required! ";
  if (!editModel.address) errors+="Address is required! ";
  //if (!editModel.image) errors+="User image is required! ";
  return errors;
};

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof IRegister
  ) => {
    setEditModel({
      ...editModel,
      [key]: key === 'birthdate' ? new Date(event.target.value) : event.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="edit-profile space-y-2">
      <h3>Edit Profile</h3>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={editModel.email}
          onChange={(e) => handleChange(e, "email")}
          className='w-full rounded-lg border-2 p-3'
          placeholder='Email'
        />
      </div>
      <div className='relative'>
        <label>Password</label>
        <input type='password' value={editModel.password} onChange={(e) => handleChange(e, "password")} className='w-full rounded-lg border-2 p-3' placeholder='Password'/>
      </div>
      <div className='relative'>
        <label>Confirm Password</label>
        <input type='password' value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className='w-full rounded-lg border-2 p-3' placeholder='Confirm Password'/>
      </div>
      <div className='relative'>
        <label>First name</label>
        <input type='text' value={editModel.firstname} onChange={(e) => handleChange(e, "firstname")} className='w-full rounded-lg border-2 p-3' placeholder='First Name'/>
      </div>
      <div className='relative'>
        <label>Last Name</label>
        <input type='text' value={editModel.lastname} onChange={(e) => handleChange(e, "lastname")} className='w-full rounded-lg border-2 p-3' placeholder='Last Name'/>
      </div>
      <div className='relative'>
        <label>Date of Birth</label>
        <input type='date' value={editModel.birthdate.toISOString().substring(0, 10)} onChange={(e) => handleChange(e, "birthdate")} className='w-full rounded-lg border-2 p-3' placeholder='Birthdate'/>
      </div>
      <div className='relative'>
        <label>Address</label>
        <input type='text' value={editModel.address} onChange={(e) => handleChange(e, "address")} className='w-full rounded-lg border-2 p-3' placeholder='Address'/>
      </div>
      <div className='relative'>
        <input type='file' accept='image/*' onChange={(e) => handleImageChange(e)} className='w-full rounded-lg border-2 p-3' />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Save Changes
      </button>
      {editError && (
        <p className='mt-4 text-primary-600 p-3'>{editError}</p>
      )}
    </form>
  );
};

export default EditProfile;