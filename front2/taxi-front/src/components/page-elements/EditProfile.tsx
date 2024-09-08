import React, { useState } from 'react';
import IUser from '../interfaces/IUser';

interface EditProfileProps {
  user: IUser | null;
}

const EditProfile: React.FC<EditProfileProps> = ({ user }) => {
  const [email, setEmail] = useState(user?.email);
  const [username, setUsername] = useState(user?.username);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle profile update logic
    console.log("Updated Profile: ", { username, email });
  };

  return (
    <form onSubmit={handleSubmit} className="edit-profile">
      <h3>Edit Profile</h3>
      <div>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Save Changes
      </button>
    </form>
  );
};

export default EditProfile;