/* global kakao */
import '../scss/Main.scss'
import React, {useEffect, useState, useMemo} from "react";
import Header from '../../header/js/Header.js'
import BookList from '../../subpage/js/BookList.js'
import { IoSearchSharp, IoClose, IoChevronBackOutline, IoChevronForward   } from "react-icons/io5";
import { Map, MapMarker, useMap } from "react-kakao-maps-sdk";
import {LIBLIST_URL, BOOKSCH_URL, LIBSCH_URL, LIBMAP_URL} from "../../../config/Host-config.js";
import { useNavigate } from "react-router-dom";

// 지도 범위 재설정
function ResetMapBounds({ points }) {
    const map = useMap();

    // 맵과 포인트(위도, 경도)가 바뀔때마다
    useEffect(() => {
        // 맵이 없거나 위도,경도가 없으면 리턴
        if (!map || points.length === 0) return;

        // 맵의 위도경도 바운드들을 가져옴
        const bounds = new kakao.maps.LatLngBounds();

        // 포인트의 위도경도를 해체
        points.forEach((p) => {
            bounds.extend(new kakao.maps.LatLng(p.lat, p.lng));
        });
        // 맵의 바운드를 다시넣어서 세팅함
        map.setBounds(bounds);

    }, [map, points]);

    return null;
}


function Main() {
    const [isKakaoLoaded, setIsKakaoLoaded] = useState(false); // 카카오 로드
    const [libList, setLibList] = useState([]); // 도서관 리스트
    const [location, setLocation] = useState({lat: 37.5665, lng: 126.9780}); // 기본값 서울
    const [error, setError] = useState(); // 에러변수
    const [modalOpen, setModalOpen] = useState(false); // 책 검색 모달
    const [isOpen, setIsOpen] = useState(null); // 지도 마커 모달
    const [bookName, setBookName] = useState([]); // 책 이름
    const [address, setAddress] = useState({city: "", province: ""}); // 현재위치주소
    const [ready, setReady] = useState(false); // 검색할 준비
    const [bookList, setBookList] = useState([]); // 검색한 책 리스트
    const [libBookList, setLibBookList] = useState([]); // 특정 ISBN으로 조회한 결과
    // const [matchedLibraries, setMatchedLibraries] = useState([]); // 특정 ISBN으로 조회한 결과
    const [page, setPage] = useState(1); // 현재페이지
    const [searchPage, setSearchPage] = useState(1); // 검색페이지
    const itemsPerPage = 10; // 페이지당 15개
    // 페이지네이션을 적용할 책리스트
    const displayedBookList = bookList.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );
    const [mergedList, setMergedList] = useState([]); // 도서관 머지
    const [hasSearched, setHasSearched] = useState(false); // 책검색 모달 on/off
    const [points, setPoints] = useState({lat: '', lng: ''}); // 셋바운드 할 위도,경도 리스트
    const [loading, setLoading] = useState(false); // 로딩


    // 카카오 맵 로딩
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
            }
            ;
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
            const saved = JSON.parse(localStorage.getItem("userLocation"));

            // 기존 저장값과 비교해서 다르면 저장
            if (
                !saved ||
                saved.city !== address.city
            ) {
                localStorage.setItem(
                    "userLocation",
                    JSON.stringify({
                        city: address.city
                    })
                );
            }
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
                    setAddress({city: city, province: province}) // address 변수에 시, 구
                    // console.log(addressName);
                    // console.log(location);

                }
            }
        );
    }

    // 도서관 검색
    const fetchGetLibList = async () => {
        try {
            const res = await fetch(LIBMAP_URL + `?mylat=${location.lat}&mylong=${location.lng}&city=${address.city}&province=${address.province}&radius=5000`, {
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
                    setPoints({lat: `${json.lantitude}`, lng: `${json.longitude}`})
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
        // console.log(bookName);
    }

    const schonClick = () => {
        setSearchPage(1);     // 검색할 때 항상 page=1
        fetchSearchBooks(1);
    };
     
    // 책 검색
    const fetchSearchBooks = async(page) => {
        try {
            setHasSearched(true);
            const res = await fetch(BOOKSCH_URL + `?keyword=${bookName}&pageNO=${page}`, {
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

    // 검색한 책을 클릭했을때
    const handleBookClick = async (isbn) => {
        try {
            setLoading(true);  // 🔥 로딩 시작
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
        } finally {
        setLoading(false); // 🔥 무조건 로딩 종료
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
                    <input type="text" className="sch-lib-input" placeholder='책이름' 
                           onClick={() => {
                               setModalOpen(true);
                               setBookList([]);
                               setHasSearched(false);
                           }}/>
                    <IoSearchSharp/>
                </div>
                <div className="lib-container">
                    <div className='lib-list'>
                        {/* 1️⃣ 도서관도 없고 책도 없을 때 */}
                        {libList.length === 0 ? (
                            <p className="lib-text">근처에 도서관이 없습니다!</p>
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
                                <p className="lib-text">근처 도서관에 해당 책이 없습니다.</p>
                        )}
    
                        {/* 3️⃣ 책이 있는 도서관 목록 표시 */}
                        {libBookList.length > 0 && libList.length > 0 && (
                            <ul className='lib-content'>
                                {mergedList.map((lib, index) => (
                                    <li key={index} className='lib-box' onClick={() => handleMarkerLink(lib)}>
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
                    <div className="lib-resch-container">
                        <button className="lib-resch-btn" onClick={fetchGetLibList}>근처 도서관 검색</button>
                    </div>
                </div>


                {/* 지도 */}
                <Map
                    id="map"
                    className="map-api"
                    center={{lat: location.lat, lng: location.lng}}
                    level={5}
                    onClick={() => setIsOpen(null)}>

                    { /* 지도 마커를 찍는 코드 */}
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
                                style="border: none;"
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

                    {/* 지도 벙위 재설정 */}
                    <ResetMapBounds
                        /* 도서관책리스트 길이가 0 이면 도서관리스트를 쓰고 아니면 합친도서관리스트의 위도 경도를 가지고 온다. */
                        points={(libBookList.length === 0 ? libList : mergedList).map(pos => ({
                            lat: pos.latitude,
                            lng: pos.longitude
                        }))}
                    />
                </Map>

            </div>
            {
                modalOpen &&
                <div className="modal-container">
                    <div className="modal-content">
                        <div className="modal-close">
                            <IoClose className="modal-close-btn" onClick={() => {
                                setModalOpen(false);
                                setHasSearched(false);      // 검색상태 초기화
                                setLibBookList([]);
                            }}/>
                        </div>
                        <div className="search-container">
                            <input type="text" className="sch-lib-input" name="bookname" onChange={bookNameHandler}
                                   placeholder="책이름"/>
                            <IoSearchSharp onClick={schonClick}/>
                        </div>
                        <div className="booklist-wrap">
                            <ul className="booklist-container">
                                {loading ? (
                                    <p className="loading-text">📖선택한 책의 도서관 검색중...</p>
                                ) : (
                                    displayedBookList.map((item, index) => (
                                        <BookList
                                            key={index}
                                            bookname={item.bookname}
                                            authors={item.authors}
                                            publisher={item.publisher}
                                            isbn={item.isbn13}
                                            onClick={handleBookClick}
                                        />
                                    ))
                                )}
                            </ul>
                            <div className="pagination-wrap">
                                {(() => {
                                    if (bookList.length === 0) return null;

                                    // 책은 10개씩 고정이니까 단순히 충분한 페이지수 노출하면 됨
                                    // 보통 API에서 totalCount를 주는데 지금 없으니까
                                    // 일단 1~5페이지 정도 고정으로 만들 수 있음
                                    const totalPages = 5; // 또는 서버가 totalCount 주면 계산하면 됨

                                    return (
                                        <div className="pagination">
                                            <button
                                                className="bookpage-btn"
                                                disabled={searchPage === 1}
                                                onClick={() => {
                                                    const newPage = searchPage - 1;
                                                    setSearchPage(newPage);
                                                    fetchSearchBooks(newPage);
                                                }}>
                                                <IoChevronBackOutline />
                                            </button>

                                            {Array.from({length: totalPages}, (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    className={searchPage === i + 1 ? "active bookpage-btn" : " bookpage-btn"}
                                                    onClick={() => {
                                                        setSearchPage(i + 1);
                                                        fetchSearchBooks(i + 1);
                                                    }}>
                                                    {i + 1}
                                                </button>
                                            ))}

                                            <button
                                                className="bookpage-btn"
                                                disabled={searchPage === totalPages}
                                                onClick={() => {
                                                    const newPage = searchPage + 1;
                                                    setSearchPage(newPage);
                                                    fetchSearchBooks(newPage);
                                                }}>
                                                <IoChevronForward />
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export default Main;