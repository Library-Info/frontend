import '../scss/BookList.scss'


function BookList({ bookname, authors, publisher, isbn, onClick }) {

    
    return (
            <li className='booklist-content' onClick={() => onClick(isbn)}>
                <p className='book-name'>{bookname}</p>
                <p className='book-authors'>{authors}</p>
                <p className='book-pulisher'>{publisher}</p>
            </li>
    );
}

export default BookList;