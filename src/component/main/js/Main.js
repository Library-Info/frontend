import '../scss/Main.scss'
import React, {useEffect, useState} from "react";
import Header from '../../header/js/Header.js'
import { IoSearchSharp } from "react-icons/io5";
import { Map, MapMarker } from "react-kakao-maps-sdk";


function Main() {
    const [libList, setLibList] = useState([]); // 도서관 위치 리스트
    const [location, setLocation] = useState({ lat: 37.5665, lng: 126.9780 }); // 기본값 서울
    const [error, setError] = useState();

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
    return (
        <div className="wrap">
            <Header/>
            <div className="search-container">
                <form action="">
                    <input type="text" className="sch-lib-input"/>
                </form>
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
    );
}

export default Main;