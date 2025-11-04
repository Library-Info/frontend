import '../scss/Header.scss'
import { RxHamburgerMenu } from "react-icons/rx";

function Header() {
    return (
        <div className="header-container">
            <RxHamburgerMenu className="burger-icon" />
        </div>
    );
}

export default Header;