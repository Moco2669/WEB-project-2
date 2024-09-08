import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import IUser from './interfaces/IUser';
import { AuthContext } from './contexts/AuthContext';

interface HeaderProps {
    user: IUser | null;
    onShowProfile: () => void;
  }

const Header : React.FC<HeaderProps> = ({user, onShowProfile}) =>{
    const { isLoggedIn } = useContext(AuthContext);

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="flex items-center">
        <img src='/TaxiLogo.png' alt="Logo" className="h-12 w-12 mr-2" />
        <span className="text-xl font-semibold">Taxi app</span>
      </div>

      {isLoggedIn && user && (
        <div className="flex items-center">
          <span className="mr-4">Welcome, <button onClick={onShowProfile} className="hover:underline">{user.username}</button>!</span>
        </div>
      )}
    </header>
  );
}

export default Header;