import {FC, useContext, useEffect, useState} from 'react';
import LoginForm from './components/LoginForm';
import { Context } from './index';
import { observer } from 'mobx-react-lite';
import { IUser } from './models/IUser';
import UserService from './services/UserService';

const App: FC = () => {
  const {store} = useContext(Context);
  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if(localStorage.getItem('token')){
        store.checkAuth()
    }
  }, [])

    async function getUsers() {
      try {
          const response = await UserService.fetchUsers();
          setUsers(response.data);
      } 
      catch(e) {
        console.log(e);
      }
    }

  if(store.isLoading) {
    return  (
      <div>Loading...</div>
    ) 
          
  }
    if(!store.isAuth) {
        return (
          
          <div>
            <LoginForm/>
            <button onClick={getUsers}>Get All Users</button>

        </div>
        )
      }
  return (
      <div>
        <h1>{store.isAuth ? `Пользователь ${store.user.email} авторизован ` : 'Авторизуйтесь, блять'}</h1>
        <h1>{store.user.isActivated ? 'Почта подтверждена' : 'зайди на почтовый ящик, осёл'}</h1>
        <button onClick={() => store.logout()}>Log out</button>
        <div>
            <button onClick={getUsers}>Get All Users</button>
        </div>
        {users.map(user => {
          return <div key={user.email}>{user.email}</div>
        })}
      </div>
  );
}

export default observer(App);
