## 🍃 탄소중립 정보 공유 커뮤니티 플랫폼 '빵끗' 🍃


### 🤗 프로젝트 소개

![표지](https://github.com/iiingkeep/community/assets/151604087/f16f36d1-49a6-4118-8baa-ff869a10d605)

***
### 📆 개발 일정
* 기획 및 설계 시작 : 2024.02.05  
* 개발 시작 : 2024.02.19  
* 검증 시작 : 2024.03.18  
* 발표 및 평가 : 2024.03.28  
* 프로젝트 종료 : 2024.04.09  
***
### ✅ 기획 의도
![기획의도](https://github.com/iiingkeep/community/assets/151603893/cca4882d-52be-4f80-b01b-ad97c4f96cd6)
***
### 🙋 팀원
* 곽별이 : MyPage, WordCloud
 
* 김민규 : Community

* 김민호 : Login, Membership-Register

* 김연진 : Main, Community

* 이주호 : News-Feed, Web-Crawling
***
### 🛠️ 기술 스택
<p align="center">
<img src="https://github.com/iiingkeep/community/assets/143868975/1340bbaf-d67f-4177-8bc4-157042594f80" />
</p>
<p align="center">
<img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/0eaee95a-3b06-432d-b19f-599c7eb31fea"/>
</p>
   
***
   
### 🎠 주요 기능
<p style="background-color:yellow">로그인</p>
  * 등록된 정보와 일치여부 확인을 통한 유효성 검사
  * 로그인 시 MySQLStore를 통한 세션 테이블 생성하여 관리
  * 로그인 시 세션에 유저 데이터 저장하 만료시간을 지정하여 1시간 후 또는 로그아웃 시 데이터 삭제
<p align="center"><img width="45%" align="center" 
  src="https://github.com/iiingkeep/community/assets/151604087/f8289786-20ad-4c89-962e-138e071ec791" /></p>

* 회원가입
  * 정규표현식과 중복 확인을 통한 유효성 검사
  * bcrypt와 hash를 사용한 비밀번호 암호화
  * 비밀번호와 비밀번호 확인 항목은 타이핑 시 동적 유효성 검사 진행
* 메인페이지
  * 첫 번째 섹션의 로그인 기능
  * 두 번째 섹션의 각 메뉴별 소개 및 이동 기능
  * 세 번째 섹션의 최신 환경 뉴스 기재, 그에 기반한 워드 클라우드 표시 및 다운로드 기능, 커뮤니티 인기글 기재
 
---
---
 
#### 환경이슈 : 네이버 검색 API를 이용, 지정한 시간에 최신 환경 뉴스를 크롤링하여 데이터 목록 표시
| 기능 | 구현 영상 |
| :---: | :---: |
| 검색 기능 | ![검색기능](https://github.com/iiingkeep/community/assets/143868975/def43f9f-f5e2-4524-b9af-dc13ebb1d05d) |
| 최신순 / 오래된 순 / 조회수 높은 순 정렬 | ![검색기능](https://github.com/iiingkeep/community/assets/143868975/9be8bf98-4f02-4d80-9b09-6be8b47dfa5e) |
| 기사 클릭 시 해당 기사의 url로 이동하며 조회수 1 증가 | ![검색기능](https://github.com/iiingkeep/community/assets/143868975/e8abca1d-7a79-431b-934b-b663ea80d332) |
| 기사 좋아요 토글 시 로그인 안 된 유저는 로그인 페이지로 이동, 로그인 된 유저는 좋아요 표시 | ![검색기능](https://github.com/iiingkeep/community/assets/143868975/cf52d480-99f5-48e5-9bda-ffbea68ad4a0) |
| 페이지네이션 | ![검색기능](https://github.com/iiingkeep/community/assets/143868975/cf87ba7d-ebf3-448f-9387-95bc65ce1dc7) |

---
---

<p>$\bf{\large{\color{#6580DD}두꺼운\ 글씨체,\ 큰글씨,\ 파란색}}$</p>

![환경이슈](https://img.shields.io/badge/환경이슈-FFF5B1?style=for-the-badge)

<img src="https://img.shields.io/badge/환경이슈-FFF5B1?style=for-the-badge" width="100px"/>   

![환경이슈](https://img.shields.io/badge/환경이슈-FFE6E6?style=for-the-badge)
![환경이슈](https://img.shields.io/badge/환경이슈-E6E6FA?style=for-the-badge)
![환경이슈](https://img.shields.io/badge/환경이슈-C0FFFF?style=for-the-badge)
![환경이슈](https://img.shields.io/badge/환경이슈-FFFFF0?style=for-the-badge)
![환경이슈](https://img.shields.io/badge/환경이슈-F5F5F5?style=for-the-badge)
![환경이슈](https://img.shields.io/badge/환경이슈-DCFFE4?style=for-the-badge)

<img src="https://img.shields.io/badge/ 환                     경                     이                     슈 -FFF5B1?style=for-the-badge" width="100%" height="60px"/>   
   
| 검색 |
| :---: |
| ![검색기능](https://github.com/iiingkeep/community/assets/143868975/def43f9f-f5e2-4524-b9af-dc13ebb1d05d) |
   
| 최신순 / 오래된 순 / 조회수 높은 순 정렬 |
| :---: |
| ![검색기능](https://github.com/iiingkeep/community/assets/143868975/9be8bf98-4f02-4d80-9b09-6be8b47dfa5e) |
   
| 기사 클릭 시 해당 기사의 url로 이동하며 조회수 1 증가 |
| :---: |
| ![검색기능](https://github.com/iiingkeep/community/assets/143868975/e8abca1d-7a79-431b-934b-b663ea80d332) |
   
| 기사 좋아요 토글 시 로그인 안 된 유저는 로그인 페이지로 이동, 로그인 된 유저는 좋아요 표시 |
| :---: |
| ![검색기능](https://github.com/iiingkeep/community/assets/143868975/cf52d480-99f5-48e5-9bda-ffbea68ad4a0) |
   
| 페이지네이션 |
| :---: |
| ![검색기능](https://github.com/iiingkeep/community/assets/143868975/cf87ba7d-ebf3-448f-9387-95bc65ce1dc7) |



* 환경이슈
  * 네이버 검색 API 이용
  * 지정한 시간에 최신 환경 뉴스를 크롤링하여 데이터 목록 표시
  * 검색 기능
  * 최신순 / 오래된 순 / 조회수 높은 순 정렬
  * 목록에서 기사 클릭 시 해당 기사의 url로 이동하며 조회수 1 증가
  * 기사 좋아요 토글 시 로그인 안 된 유저는 로그인 페이지로 이동, 로그인 된 유저는 좋아요 표시
  * 페이지네이션
   

 
* 커뮤니티 글 목록
  * 유저가 작성한 글을 카테고라이징하여 목록으로 표시
  <p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/919391ae-9621-4d30-8fff-7c593d4a235d" />
  </p>   
   
   
  * 제목 / 본문 / 제목+본문 검색   

  <p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/0f616d61-3b35-436b-b7ec-51cf9d8a86ba" />
  </p>  
   
  * 게시글 클릭하여 접속 시 조회수 1 증가
  * 페이지네이션  
   
  <p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/ba0a4778-a8fd-44b1-969c-77b81a3f01fb" />
  </p>
   
* 커뮤니티 글 쓰기 / 수정
  * 로그인 한 유저만 글쓰기
  * Quill 에디터 사용으로 다양한 기능 이용 가능
  * 사진 등록, 크기 조절 가능
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/cff90797-0926-46b6-8c2f-875617e11921" />
</p>
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/543dc1cf-dd43-4f3b-82ed-4feb246fd7fb" />
</p>   
   
* 커뮤니티 게시글 상세
  * 게시글 작성자 본인만 수정/ 삭제
  * 로그인 한 유저는 좋아요 등록 및 등록 해제 가능
  * 로그인 한 유저는 댓글 및 답글 등록
  * 댓글 작성자 본인만 댓글 수정 / 삭제  
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/9be25d05-1531-4bb5-b2dc-67490a680908" />
</p>
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/12947b13-e6b4-457b-8b92-904fced1d74a" />
</p>
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/47caf440-023b-4b8e-b137-dc512f167f49" />
</p>
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/69329bf7-c0b5-4a74-b8ef-2faae23168d9" />
</p>
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/e991b91a-04b5-4fdc-93dd-5e16de43ffb1" />
</p>   
   
* 마이페이지 프로필
  * 프로필 사진 등록 및 삭제
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/2ad671e1-d86c-410d-b791-ff56cc68aee9" />
</p>
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/e60cacc9-cd97-45b5-80f9-b60c60310f2d" />
</p>

* 마이페이지 나의 정보 수정
  * 회원 정보 수정 시 비밀번호 확인 후 페이지 이동
  * 회원 정보 수정 시 정규표현식과 중복검사를 통한 유효성 검사
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/6eab012d-1da5-411b-9ed6-3361225165ae" />
</p>
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/d339fabc-b153-4183-88b9-10a664929820" />
</p>   

* 마이페이지 나의 활동
  * 내가 쓴 글 / 내가 쓴 댓글 표시 및 클릭 시 해당 페이지로 이동

<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/a1ddf691-7c81-434b-ae75-21feeea80810" />
</p>
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/9c08340d-88f4-4d51-bff9-33f2e7fe734b" />
</p>   
* 마이페이지 좋아요
  * 좋아요 한 뉴스 / 좋아요 한 게시글 표시 및 클릭 시 해당 페이지로 이동   
   
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/c072c01b-4bd4-4f55-9f7a-5206baa75ba1" />
</p>
<p align="center"><img width="80%" src="https://github.com/iiingkeep/community/assets/143868975/475ca059-54da-4df2-b03a-4688255f9a5f" />
</p>
