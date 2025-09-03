export type Genre =
  | "AAAA" // 연극
  | "BBBC" // 무용(서양/한국무용)
  | "BBBE" // 대중무용
  | "CCCA" // 서양음악(클래식)
  | "CCCC" // 한국음악(국악)
  | "CCCD" // 대중음악
  | "EEEA" // 복합
  | "EEEB" // 서커스/마술
  | "GGGA"; // 뮤지컬

export type CityCode =
  | "11" // 서울
  | "28" // 인천
  | "30" // 대전
  | "27" // 대구
  | "29" // 광주
  | "26" // 부산
  | "31" // 울산
  | "36" // 세종
  | "41" // 경기
  | "43" // 충청
  | "44" // 충청
  | "47" // 경상
  | "48" // 경상
  | "45" // 전라
  | "46" // 전라
  | "51" // 강원
  | "50" // 제주
  | "UNI"; // 대학로

export type PrfState =
  | "01" // 공연예정
  | "02" // 공연중
  | "03"; // 종료

export interface ArtDomain {
  genreCode: Genre;
  title: string;
}

export interface ArtItem {
  mt20id: string; // 공연ID
  prfnm: string; // 공연명
  prfpdfrom: string; // 공연시작일
  prfpdto: string; // 공연종료일
  fcltynm: string; // 공연시설명(공연장명)
  poster: string; // 포스터이미지경로
  area: string; // 공연지역
  genrenm: string; // 공연 장르명
  openrun: "Y" | "N"; // 오픈런
  prfstate: string; // 공연상태
}

export interface GetArtListParams {
  cpage?: string; // 시작페이지 번호
  rows?: string; // 한번에 가져올 데이터 수
  startDate?: string; // 공연 시작날짜
  endDate?: string; // 공연 마감날짜
  genreCode: Genre; // 장르 코드
  prfstate?: PrfState; // 공연 상태 코드
  signgucode?: CityCode; // 도시 코드
}

export interface ApiResponseParams {
  cpage: string;
  rows: string;
  startDate: string;
  endDate: string;
  genreCode: Genre;
}

/**
 * @description API 성공 응답 타입
 * API가 성공적으로 데이터를 반환할 때의 구조를 정의합니다.
 */
export interface ArtListSuccessResponse {
  success: true;
  data: ArtItem[];
}

/**
 * @description API 실패 응답 타입
 * API 호출이 실패했을 때의 구조를 정의합니다.
 */
export interface ArtListErrorResponse {
  success: false;
  message: string;
}
