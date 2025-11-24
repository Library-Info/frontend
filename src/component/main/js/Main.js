/* global kakao */
import '../scss/Main.scss'
import React, {useEffect, useState} from "react";
import Header from '../../header/js/Header.js'
import BookList from '../../subpage/js/BookList.js'
import { IoSearchSharp, IoClose  } from "react-icons/io5";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import {LIBLIST_URL, BOOKSCH_URL, LIBSCH_URL} from "../../../config/Host-config.js";


function Main() {
    const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
    const [libList, setLibList] = useState([]); // 도서관 리스트
    const [location, setLocation] = useState({ lat: 37.5665, lng: 126.9780}); // 기본값 서울
    const [error, setError] = useState(); // 에러변수
    const [modalOpen, setModalOpen] = useState(false); // 책 검색 모달
    const [isOpen, setIsOpen] = useState(null); // 지도 마커 모달
    const [bookName, setBookName] = useState([]); // 책 이름
    const [address, setAddress] = useState({ city: "", province: "" }); // 현재위치주소
    const [ready, setReady] = useState(false); // 검색할 준비
    const [bookList, setBookList] = useState([]); // 검색한 책 리스트
    const [libBookList, setLibBookList] = useState([]); // 특정 ISBN으로 조회한 결과
    // const [matchedLibraries, setMatchedLibraries] = useState([]); // 특정 ISBN으로 조회한 결과
    const [page, setPage] = useState(1); // 현재페이지
    const itemsPerPage = 10; // 페이지당 15개
    const displayedBookList = bookList.slice( 
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );
    const [mergedList, setMergedList] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
                setIsKakaoLoaded(true);
            });
        } else {
            const script = document.createElement("script");
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAOMAP_KEY}&autoload=false&libraries=services`;
            script.async = true;
            script.onload = () => {
                window.kakao.maps.load(() => {
                    setIsKakaoLoaded(true);
                });
            };
            document.head.appendChild(script);
        }
    }, []);


    // ✅ 2단계: 사용자 위치 가져오기
    useEffect(() => {
        if (isKakaoLoaded) {

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    (err) => {
                        console.error("위치 가져오기 실패:", err.message);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                );
            };
        }
    }, [isKakaoLoaded]);

    // ✅ 3단계: Kakao SDK + 위치 둘 다 준비되면 주소 변환 실행
    useEffect(() => {
        if (isKakaoLoaded && location.lat && location.lng) {
            getAddr(location.lat, location.lng);
        }
    }, [isKakaoLoaded, location]);

    // 주소(address)가 변경되면 도서관 리스트 요청
    useEffect(() => {
        if (address.city && address.province) {
            fetchGetLibList();
        }
    }, [address]);

    // 경도와 위도로 주소변환
    const getAddr = (lat, lng) => {
        // 주소-좌표 변환 객체를 생성합니다
        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.coord2Address(
            lng, // 경도
            lat, // 위도
            (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const addressName = result[0]?.address?.address_name || "";
                    const parts = addressName.split(" ");
                    const city = parts[0] || "";
                    const province = parts[1] || "";
                    setAddress({ city: city, province: province }) // address 변수에 시, 구
                    // console.log(addressName);
                    // console.log(location);
                
                }
            }
        );
    }

    // 도서관 검색
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

    
    // 책이름을 적을때마다 새로 변수에 넣음
    const bookNameHandler = (e) => {
        const inputVal = e.target.value;
        setBookName(inputVal);
        console.log(bookName);
    }

     
    // 책 검색
    const schonClick = async() => {
        try {
            setHasSearched(true);
            const res = await fetch(BOOKSCH_URL + `?keyword=${bookName}&pageNO=${1}`, {
                method: 'GET',
                // headers: {
                //     'Content-Type': 'application/json',
                // },
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

    // 검색한 책을 클릭했을때
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
                setLibBookList(data);
                setModalOpen(false);
            }
        } catch (error) {
            console.error("Error sending ISBN:", error);
        }
    };

    useEffect(() => {
        // libList: 전체 도서관 리스트
        // libBookList: 도서 소장 도서관 리스트 (ISBN 기준 조회 결과)

        // 두 배열에서 libCode가 일치하는 도서관과 libBookList 병합
        const mergeList = libBookList.flatMap(book =>
            libList
                .filter(lib => lib.libCode === book.libCode) // 일치하는 모든 도서관 찾기
                .map(lib => ({
                    ...lib,           // 도서관 정보 복사
                    hasBook: book.hasBook,
                    loanAvailable: book.loanAvailable,
                }))
        );
        setMergedList(mergeList);
            
        // console.log(mergeList);

    },[libBookList])

    const handleMarkerClick = (index) => {
        if (isOpen === null) {
            setIsOpen(index)
        } else if (isOpen === index) {
            // e.stopPropagation();
            setIsOpen(null)
        }
    }

    const handleMarkerLink = (position) => {
        window.open(`https://map.kakao.com/link/by/traffic/내위치,${location.lat},${location.lng}/${position.libName},${position.latitude},${position.longitude}`)
    }

    return (
        <div className="wrap">
            <Header/>
            <div className="main-container">
                <div className="search-container">
                    <input type="text" className="sch-lib-input" placeholder='책이름' value=""
                           onClick={() => {
                               setModalOpen(true);
                               setHasSearched(false);
                           }}/>
                    <IoSearchSharp/>
                </div>
                <div className='lib-list'>
                    {/* 1️⃣ 도서관도 없고 책도 없을 때 */}
                    {libList.length === 0 ? (
                        <p>근처에 도서관이 없습니다!</p>
                    ) : mergedList.length === 0 ? (
                        <ul className='lib-content'>
                            {libList.map((lib, index) => (
                                <li key={index} className='lib-box'>
                                    <p className='lib-name'>{lib.libName}</p>
                                    <p className='lib-address'>{lib.address}</p>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {/* 2️⃣ 도서관은 있지만 책이 없을 때 */}
                    {hasSearched && libList.length >= 1 && libBookList.length === 0 && (
                            <p>근처 도서관에 해당 책이 없습니다.</p>
                    )}

                    {/* 3️⃣ 책이 있는 도서관 목록 표시 */}
                    {libBookList.length > 0 && libList.length > 0 && (
                        <ul className='lib-content'>
                            {mergedList.map((lib, index) => (
                                <li key={index} className='lib-box'>
                                    <p className='lib-name'>{lib.libName}</p>
                                    <p className='lib-address'>{lib.address}</p>
                                    <p className='loans-status'>
                                        대출가능여부 : {lib.loanAvailable === 'Y' ? '가능' : '불가능'}
                                    </p>
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
                        level={5}
                        onClick={() => setIsOpen(null)}>
                        {libBookList.length === 0 ? (
                            libList.map((position, index) => (
                                <MapMarker
                                    key={`${position.latitude}_${position.longitude}_${index}`}
                                    position={{lat: position.latitude, lng: position.longitude}}
                                    onClick={() => handleMarkerClick(index)}>

                                    {isOpen === index && (
                                        <div className="marker-wrap">
                                            <div className="marker-name">{position.libName}</div>
                                            <button className="marker-map-link"
                                                    onClick={() => handleMarkerLink(position)}>길찾기</button>
                                        </div>
                                    )}
                                </MapMarker>
                            ))
                        ) : (
                            mergedList.map((position, index) => (
                                <MapMarker
                                    key={`${position.latitude}_${position.longitude}_${index}`}
                                    position={{lat: position.latitude, lng: position.longitude}}
                                    onClick={() => handleMarkerClick(index)}>

                                    {isOpen === index && (
                                        <div className="marker-wrap">
                                            <div className="marker-name">{position.libName}</div>
                                            <button className="marker-map-link"
                                                    onClick={() => handleMarkerLink(position)}>길찾기</button>
                                        </div>
                                    )}
                                </MapMarker>
                            ))
                        )
                        }
                    </Map>
                    
                {/*</div>*/}
            </div>
            {
                modalOpen &&
                <div className="modal-container">
                    <div className="modal-content">
                        <div className="modal-close">
                            <IoClose className="modal-close-btn" onClick={() => setModalOpen(false)}/>
                        </div>
                        <div className="search-container">
                            <input type="text" className="sch-lib-input" name="bookname" onChange={bookNameHandler}
                                   placeholder="책이름"/>
                            <IoSearchSharp onClick={schonClick}/>
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