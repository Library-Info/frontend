import '../scss/BookRecommend.scss'
import React, {useEffect, useState} from "react";
import Header from '../../header/js/Header.js'
import { LIBRECOMMEND_URL } from "../../../config/Host-config.js";
import { useLocation } from "react-router-dom";
import { FormControl, Select as MuiSelect, MenuItem } from '@mui/material';

function BookRecommend() {
    // 기본 세팅
    const [age, setAge] = useState(20);
    const [gender, setGender] = useState('여성');
    const [recommendBook, setRecommendBook] = useState([]);
    const [rcTitle, setRcTitle] = useState({age: "20대", gender: "여성"});
    const minorLabels = ["영유아", "유아", "초등생", "청소년"]; // 미성년자
    const savedLocation = JSON.parse(localStorage.getItem("userLocation"));
    const [loading, setLoading] = useState(false);


    // BookRecommend.js 파일 내에 작성
    const ageOptions = [
        // 추가된 항목에 대한 value를 API에 맞춰 설정해야 합니다.
        { value: 0, label: "영유아" },
        { value: 6, label: "유아" },
        { value: 8, label: "초등생" },
        { value: 14, label: "청소년" },
        { value: 20, label: "20대" }, // 현재 기본값
        { value: 30, label: "30대" },
        { value: 40, label: "40대" },
        { value: 50, label: "50대" },
        { value: 60, label: "60대" },

    ];
    const genderOptions = [
        { value: '여성', label: '여자' }, // 현재 기본값
        { value: '남성', label: '남자' },
    ];

    useEffect(() => {
        fetchGetRecommend();
        // console.log(savedLocation.city);
    }, [savedLocation.city]);

    // 추천 책 검새
    const fetchGetRecommend = async () => {
        try {
            setLoading(true);  // 🔥 로딩 시작

            const res = await fetch(LIBRECOMMEND_URL + `?age=${age}&gender=${gender}&region=${savedLocation.city}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                const json = await res.json();
                if (json) {
                    setRecommendBook(json);
                    changeTitle();
                }
            }
        } catch (error) {
            console.error("Error fetching recommend:", error);
        } finally {
            setLoading(false); // 🔥 무조건 로딩 종료
        }
    }


    // 나이 변경 핸들러
    const handleChangeAge = (event) => {
        const newValue = event.target.value;
        setAge(newValue);

        const newAgeLabel = ageOptions.find(option => option.value === newValue)?.label || '';

    }

    // 성별 변경 핸들러
    const handleChangeGender = (event) => {
        const newValue = event.target.value;
        setGender(event.target.value);

    }


    const changeTitle = () => {
        // 현재 age의 label 찾기
        const ageLabel = ageOptions.find(opt => opt.value === Number(age))?.label;

        // 현재 gender의 label 찾기
        // const genderLabel = genderOptions.find(opt => opt.value === gender)?.label;

        // 미성년자인지 판단
        const isMinor = minorLabels.includes(ageLabel);

        // 미성년자일 경우 성별 텍스트 변환
        const finalGender = isMinor
            ? (gender === "여성" ? "여자" : "남자")
            : gender; // 여성/남성 그대로 사용

        // 최종 타이틀 업데이트
        setRcTitle({
            age: ageLabel,
            gender: finalGender
        });

    }

    return (
        <div className="recommend-wrap">
            <Header/>
            <div className="recommend-container">
                <div className="recommend-sch-box">
                    <div className="recommend-title">
                        <p>{rcTitle.age} {rcTitle.gender}추천책</p>
                    </div>
                    <div className="recommend-sch">
                        {/* 📚 나이 - MUI Select */}
                        <FormControl size="small" className="mui-select-control-box">
                            <MuiSelect
                                value={age} // 현재 상태 값
                                onChange={handleChangeAge}
                                displayEmpty
                            >
                                {ageOptions.map((option) => (
                                    // value에는 API에 보낼 실제 값(20, 'teen' 등)을 사용합니다.
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </MuiSelect>
                        </FormControl>

                        {/* 🚻 성별 - MUI Select */}
                        <FormControl size="small" className="mui-select-control-box">
                            <MuiSelect
                                value={gender} // 현재 상태 값
                                onChange={handleChangeGender}
                                displayEmpty
                            >
                                {genderOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </MuiSelect>
                        </FormControl>

                        <button type="button" className="rc-sch-btn" onClick={() => {fetchGetRecommend()}}>검색</button>
                    </div>
                </div>
                <ul className='recommend-content'>
                    {loading ? (
                        <p className="loading-text">📚 추천 도서 불러오는 중...</p>
                    ) : (
                        recommendBook.map((book, index) => (
                            <li key={index} className='book-box'>
                                <div className="recommend-img-box">
                                    <img className="recommend-img" src={book.bookImageURL} alt={book.isbn13}/>
                                </div>
                                <div className="recommend-books">
                                    <p className="recommend-bookname">{book.bookname}</p>
                                    <p className="recommend-bookauthors">{book.authors}</p>
                                    <p className="recommend-bookpublisher">{book.publisher}</p>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}

export default BookRecommend;