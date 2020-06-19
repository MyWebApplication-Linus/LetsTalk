import React from 'react'
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar bg-dark">
            <h1>
                <Link to='/'>
                    <i className="fas fa-code"></i> LetsTalk
                </Link>
            </h1>
            <ul>
                <li><a href="!3=">Developers</a></li>
                <li>
                    <Link to="/register">SignUp</Link>
                </li>
                <li>
                    <Link to="login">SignIn</Link>
                </li>
            </ul>
        </nav >
    )
}

export default Navbar