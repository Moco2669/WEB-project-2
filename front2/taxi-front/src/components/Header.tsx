import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import IUser from './interfaces/IUser';
import { AuthContext } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    user: IUser | null;
    onShowProfile: () => void;
  }

const Header : React.FC<HeaderProps> = ({user, onShowProfile}) =>{
  const { isLoggedIn, token, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = () => {
    setToken(null);
    navigate('/');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="flex items-center">
        <img src='/TaxiLogo.png' alt="Logo" className="h-12 w-12 mr-2" />
        <span className="text-xl font-semibold">Taxi app</span>
      </div>

      {token && user && (
        <div className="flex items-center">
          <span className="mr-4">Welcome, <button onClick={onShowProfile} className="hover:underline">{user.username}</button>!</span>
          {user.imagebase64 && (
            <img
              src={`data:image/jpeg;base64,${user.imagebase64}`}
              alt="User"
              className="h-10 w-10 rounded-full object-cover mr-4"
            />
          )}
        </div>
      )}
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Sign Out
          </button>
    </header>
  );
}

export default Header;