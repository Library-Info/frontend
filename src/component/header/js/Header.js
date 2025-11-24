import '../scss/Header.scss'
import { RxHamburgerMenu } from "react-icons/rx";
import React, {useEffect, useState} from "react";
import { Turn as Hamburger } from 'hamburger-react'
import { Link } from "react-router"

function Header() {
    const [isOpen, isClose] = useState(false);


    return (
        <div className="header-wrap">
            <div className="header-container">
                <Hamburger toggled={isOpen} toggle={isClose} />
            </div>
            {isOpen && (
                <div className="hamburger-container">
                    <div className="hamburger-menu">
                        <Link to="/" className="side-menu">홈</Link>
                        <Link to="/recommend" className="side-menu">추천도서</Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Header;