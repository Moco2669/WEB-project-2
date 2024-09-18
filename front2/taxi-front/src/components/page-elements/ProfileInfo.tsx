import React from 'react';
import IUser from '../interfaces/IUser';

interface ProfileInfoProps {
  user: IUser | null;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  return (
    <div className="profile-info items-center justify-center space-y-2">
      {user != null && (
        <>
          <h2>{user.username}'s Profile</h2>
          {user.imagebase64 && (
            <img
              src={`data:image/jpeg;base64,${user.imagebase64}`}
              alt="User"
              className="h-24 w-24 rounded-full object-cover mr-4"
            />
          )}
          <p>Username: {user.username}</p>
          <p>UserType: {user.usertype}</p>
        </>
      )}
    </div>
  );
};

export default ProfileInfo;