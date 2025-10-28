/* global kakao */
import '../scss/Main.scss'
import React, {useEffect, useState} from "react";
import Header from '../../header/js/Header.js'
import { IoSearchSharp, IoClose  } from "react-icons/io5";
import { Map, MapMarker } from "react-kakao-maps-sdk";


function Main() {
    const [libList, setLibList] = useState([]); // 도서관 위치 리스트
    const [location, setLocation] = useState({ lat: 37.5665, lng: 126.9780 }); // 기본값 서울
    const [error, setError] = useState();
    const [modalOpen, setModalOpen] = useState(false);
    const [bookName, setBookName] = useState([]);
    const [address, setAddress] = useState([]);

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
            getAddr(location);
        } else {
            // setError("Geolocation이 지원되지 않는 브라우저입니다.");
        }

    }, []);


    function getAddr(location){
        // 주소-좌표 변환 객체를 생성합니다
        let geocoder = new kakao.maps.services.Geocoder();

        geocoder.coord2Address(
            location.lng, // 경도
            location.lat, // 위도
            (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                const addressName = result[0]?.address?.address_name || "주소를 찾을 수 없음";
                setAddress(addressName); // 변환된 주소 저장
                console.log(addressName);
                
                }
            }
        );
    }

    useEffect(()=>{
       
    })

    const bookNameHandler = (e) => {
        const inputVal = e.target.value;
        setBookName(inputVal);
        // console.log(bookName);
    }

     

    
    const schonClick = async() => {
        // const res = await fetch(SEND_LETTER_URL, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         toUser: `${touser}`,
        //         // fromUser:`${fromuser}`, // 나 (안됨 애초에 userId가 없음 토큰으로 해야함
        //         content:`${content}`,
        //         // date:{date},
        //         letterTemplateId:'1'
        //     })
        // });
        // if (res.ok) {
        //     const json = await res.json();
        //     redirection('/friend');
        //     console.log(json);
        // } else {
        //     console.error('응답 상태 코드:', res.status);
        //     alert('서버와의 통신이 원활하지 않습니다. 상태 코드: ' + res.status);
        // }
    }

    return (
        <div className="wrap">
            <Header/>
            <div className="main-container">
                <div className="search-container">
                    <input type="text" className="sch-lib-input" placeholder='책이름' value="" onClick={()=>setModalOpen(true)}/>
                    <IoSearchSharp/>
                </div>
                <div className="lib-list">
                    
                </div>
                {/*<div className="implied-map">*/}
                    <Map
                        id="map"
                        className="map-api"
                        center={{lat: location.lat, lng: location.lng}}
                        level={5}>

                        {libList.map((position, index) => (
                            <MapMarker
                                key={`${position.x}_${position.y}`}
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
                    </div>
                </div>
            }
        </div>
    );
}

export default Main;