import '../scss/BookRecommend.scss'
import React, {useEffect, useState} from "react";
import Header from '../../header/js/Header.js'
import { LIBRECOMMEND_URL } from "../../../config/Host-config.js";

function BookRecommend() {
    // 기본 세팅
    const [age, setAge] = useState(20);
    const [gender, setGender] = useState('여성');
    const [recommendBook, setRecommendBook] = useState([]);

    useEffect(() => {
        fetchGetRecommend();
    }, []);

    const fetchGetRecommend = async () => {
        try {
            const res = await fetch(LIBRECOMMEND_URL + `?age=${age}&gender=${gender}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                const json = await res.json();
                if (json) {
                    console.log(json);
                    setRecommendBook(json);
                }
            }
        } catch (error) {
            console.error("Error fetching upcycle posts:", error);
        }
    }


    return (
        <div>
            <Header/>
            <ul className='recommend-content'>
                {recommendBook.map((book, index) => (
                    <li key={index} className='book-box'>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BookRecommend;