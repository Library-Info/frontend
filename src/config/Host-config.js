const clientHostName = window.location.hostname;
console.log('client : ', clientHostName);

const LOCAL_PORT = '8080';
const API_BASE_URL = 'http://localhost:' + LOCAL_PORT;

const LOCATION_URL = 'http://localhost:3000';

// const S3URL = '..';
// const DEPLOY_BACKEND = "http://13.209.200.203";
//
// let backendHost;
//
// if (clientHostName === "localhost") {
//     backendHost = API_BASE_URL;
// } else if (clientHostName === S3URL) {
//     backendHost = DEPLOY_BACKEND;
// }

const LIBLIST = '/library/list';
const LIBRECOMMEND = '/library/recommend';
const LIBMAP = '/library/map/kakao';
const BOOKSCH = '/search/books';
const LIBSCH = '/search/isbn/library'
// const UPCYCLE = '/api/upcycle'
// const MEET = '/api/meeting'
//
//
export const LIBLIST_URL = API_BASE_URL + LIBLIST;
export const LIBRECOMMEND_URL = API_BASE_URL + LIBRECOMMEND;
export const LIBMAP_URL = API_BASE_URL + LIBMAP;
export const BOOKSCH_URL = API_BASE_URL + BOOKSCH;
export const LIBSCH_URL = API_BASE_URL + LIBSCH;
// export const UPCYCLE_URL = API_BASE_URL + UPCYCLE;
// export const MEET_URL = API_BASE_URL + MEET;
// export const KAKAO_URL=`https://kauth.kakao.com/oauth/authorize`;
export const REST_API_KEY=`206167c2444417c4b693c92fe1e1f633`;
// export  const REDIRECT_URI=`http://localhost:3000/sign_in`;