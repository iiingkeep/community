

// export const formattedDate = (timestamp) =>  {
//   const date = new Date(timestamp);
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

// 게시글 작성 시간을 변환하는 함수
export const formattedDateAndTime = (createdAt) => {
  const date = new Date(createdAt);
  
  // 각 부분의 값을 가져옴
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  // 오전/오후 구분
  const ampm = hour < 12 ? '오전' : '오후';
  
  // 12시간제로 변경
  const formattedHour = hour % 12 || 12;
  
  // 출력 형식 조합
  const formattedDateTime = `${year}. ${month}. ${day} ${ampm} ${formattedHour}:${minute}`;
  
  return formattedDateTime; // 날짜와 시간 반환
};