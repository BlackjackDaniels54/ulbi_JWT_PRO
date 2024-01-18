import React, { useState, FC, useContext } from 'react'
import { Context } from '../index';
import { observer } from 'mobx-react-lite';

const LoginForm:FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPass] = useState<string>('');
    const {store} = useContext(Context)

    return (
        <div>
            <input 
                onChange={e => setEmail(e.target.value)}
                value={email}
                type="text" 
                placeholder='Email'    
            />
            <input 
                onChange={e => setPass(e.target.value)}
                value={password}
                type="password" 
                placeholder='Password'    
            />
            <button onClick={() => store.login(email, password)}>
                Login
            </button>
            <button onClick={() => store.registration(email, password)}>
                Registration
            </button>
        </div>
  )
}

export default observer(LoginForm);