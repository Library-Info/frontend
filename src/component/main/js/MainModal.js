import { IoSearchSharp, IoClose  } from "react-icons/io5";
function MainModal() {
    
    return (
        <div className="modal-container" >
            <div className="modal-content">
                <div className="modal-close">
                    <IoClose  className="modal-close-btn" onClick={() => setModalOpen(false)}/>
                </div>
                <div className="search-container">
                    <input type="text" className="sch-lib-input" name="bookname" onChange={bookNameHandler} placeholder="책이름"/>
                    <IoSearchSharp onClick={schonClick} />
                </div>
            </div>
        </div>
    )
}

export default MainModal;