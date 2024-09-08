import React from 'react';
import IUser from '../interfaces/IUser';

interface ProfileInfoProps {
  user: IUser | null;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  return (
    <div className="profile-info">
        {user!=null &&(
            <>
                <h2>{user.username}'s Profile</h2>
                <p>Email: {user.email}</p>
            </>
        )}
    </div>
  );
};

export default ProfileInfo;