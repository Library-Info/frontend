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
// const UPCYCLE = '/api/upcycle'
// const MEET = '/api/meeting'
//
//
export const LIBLIST_URL = API_BASE_URL + LIBLIST;
// export const UPCYCLE_URL = API_BASE_URL + UPCYCLE;
// export const MEET_URL = API_BASE_URL + MEET;
// export const KAKAO_URL=`https://kauth.kakao.com/oauth/authorize`;
export const REST_API_KEY=`75f4e97c95a20a05b08c102f76677c36`;
// export  const REDIRECT_URI=`http://localhost:3000/sign_in`;