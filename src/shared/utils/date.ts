/**
 * yyyymmdd 형태의 date 문자열을 반환합니다.
 * @param date
 * @returns
 */
export const getSimpleDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
};
