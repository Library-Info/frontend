/* global kakao */
import '../scss/Main.scss'
import React, {useEffect, useState} from "react";
import Header from '../../header/js/Header.js'
import BookList from '../..//subpage/js/BookList.js'
import { IoSearchSharp, IoClose  } from "react-icons/io5";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import {LIBLIST_URL, BOOKSCH_URL, LIBSCH_URL} from "../../../config/Host-config.js";


function Main() {
    const [libList, setLibList] = useState([]); // 도서관 리스트
    const [location, setLocation] = useState({ lat: 37.5665, lng: 126.9780 }); // 기본값 서울
    const [error, setError] = useState(); // 에러변수
    const [modalOpen, setModalOpen] = useState(false); // 책 검색 모달
    const [bookName, setBookName] = useState([]); // 책 이름
    const [address, setAddress] = useState({ city: "", province: "" }); // 현재위치주소
    const [ready, setReady] = useState(false); // 검색할 준비
    const [bookList, setBookList] = useState([]); // 검색한 책 리스트
    const [page, setPage] = useState(1); // 현재페이지
    const itemsPerPage = 10; // 페이지당 15개
    const displayedBookList = bookList.slice( 
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    useEffect(() => {
        // 현재 위치 가져오기
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    
                    // setError(null);
                    console.log(location);
                },
                (err) => {
                    console.error("위치 가져오기 실패:", err.message);
                    // setError("위치를 가져올 수 없습니다. 기본 위치로 설정합니다.");
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            // setError("Geolocation이 지원되지 않는 브라우저입니다.");
        }
        
    }, []);

    useEffect(() => {
        if (location.lat && location.lng) {
            getAddr();
        }
    }, [location]);

    // 주소(address)가 변경되면 도서관 리스트 요청
    useEffect(() => {
        if (address.city && address.province) {
            fetchGetLibList();
        }
    }, [address]);


    const getAddr = () => {
        // 주소-좌표 변환 객체를 생성합니다
        let geocoder = new kakao.maps.services.Geocoder();

        geocoder.coord2Address(
            location.lng, // 경도
            location.lat, // 위도
            (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const addressName = result[0]?.address?.address_name || "";
                    const parts = addressName.split(" ");
                    const city = parts[0] || "";
                    const province = parts[1] || "";
                    setAddress({ city: city, province: province }) // address 변수에 시, 구
                
                }
            }
        );
    }

    const fetchGetLibList = async() => {
        try {
            const res = await fetch(LIBLIST_URL + `?lantitude=${location.lat}&longitude=${location.lng}&city=${address.city}&province=${address.province}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                const json = await res.json();
                if (json) {
                    console.log(json);
                    setLibList(json);
                }
            }
        } catch (error) {
            console.error("Error fetching upcycle posts:", error);
        }
    }

    

    const bookNameHandler = (e) => {
        const inputVal = e.target.value;
        setBookName(inputVal);
        console.log(bookName);
    }

     

    
    const schonClick = async() => {
        try {
            const res = await fetch(BOOKSCH_URL + `?keyword=${bookName}&pageNO=${1}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                const json = await res.json();
                if (json) {
                    console.log(json);
                    setBookList(json);
                }
            }
        } catch (error) {
            console.error("Error fetching :", error);
        }
    }

    const handleBookClick = async (isbn) => {
        try {
             // libList 안의 libCode만 추출
            const libraryCodeList = libList.map(lib => lib.libCode);
            const res = await fetch(LIBSCH_URL, {
                method: 'POST', // GET 대신 POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    isbn13: isbn,
                    libraryCodeList: libraryCodeList
                }), // isbn만 전송
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Response:', data);

                setModalOpen(false);
            }
        } catch (error) {
            console.error("Error sending ISBN:", error);
        }
    };     

    return (
        <div className="wrap">
            <Header/>
            <div className="main-container">
                <div className="search-container">
                    <input type="text" className="sch-lib-input" placeholder='책이름' value="" onClick={()=>setModalOpen(true)}/>
                    <IoSearchSharp/>
                </div>
                <div className="lib-list">
                    {libList.length === 0 ? (
                        <p>근처에 도서관이 없습니다!</p>
                    ) : (
                        <ul className='lib-content'>
                            {libList.map((lib, index) => (
                                <li key={index} className='lib-box'>
                                    <p className='lib-name'>{lib.libName}</p>
                                    <p className='lib-address'>{lib.address}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/*<div className="implied-map">*/}
                    <Map
                        id="map"
                        className="map-api"
                        center={{lat: location.lat, lng: location.lng}}
                        level={5}>

                        {libList.map((position, index) => (
                            <MapMarker
                                key={`${position.x}_${position.y}_${index}`}
                                position={{lat: position.x, lng: position.y}}
                            />
                        ))}
                    </Map>
                {/*</div>*/}
            </div>
            {
                modalOpen &&
                <div className="modal-container" >
                    <div className="modal-content">
                        <div className="modal-close">
                            <IoClose  className="modal-close-btn" onClick={() => setModalOpen(false)}/>
                        </div>
                        <div className="search-container">
                            <input type="text" className="sch-lib-input" name="bookname" onChange={bookNameHandler} placeholder="책이름"/>
                            <IoSearchSharp onClick={schonClick} />
                        </div>
                        <ul className="booklist-wrap">
                            {displayedBookList.map((item, index) => (
                                <BookList
                                    key={index}
                                    bookname={item.bookname}
                                    authors={item.authors}
                                    publisher={item.publisher}
                                    isbn={item.isbn13}
                                    onClick={handleBookClick}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            }
        </div>
    );
}

export default Main;