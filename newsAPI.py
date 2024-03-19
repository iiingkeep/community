import requests # HTTP 요청 / 웹 페이지의 HTML 내용을 가져오거나 API로부터 데이터 요청 가능
from bs4 import BeautifulSoup # HTML 문서 파싱(분석, 원하는 데이터 가져옴) 및 검색
import pymysql # MySQL과 상호 작용
import csv # CSV파일 읽기 및 생성
import re # 정규표현식을 사용 할 수 있게 해줌[내장]
import os # 운영 체제와 상호 작용(디렉토리 및 파일 관리, 경로 조작, 실행 등)[내장]
from datetime import datetime # 날짜, 시간 다루는 클래스나 함수 제공 모듈[내장]
from dotenv import load_dotenv # env 파일 사용

load_dotenv()

NCI = os.environ.get('NAVER_CLIENT_ID')
NCS = os.environ.get('NAVER_CLIENT_SECRET')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = int(os.environ.get('DB_PORT'))
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_DATABASE = os.environ.get('DB_DATABASE')

# 네이버 검색 API 설정
naver_client_id = NCI # API 클라이언트 ID
naver_client_secret = NCS # API 클라이언트 SECRET
news_url = 'https://openapi.naver.com/v1/search/news.json'
query = '탄소중립' # 검색어 지정

# 네이버 검색 API 호출
headers = {'X-Naver-Client-Id': naver_client_id, 'X-Naver-Client-Secret': naver_client_secret}
# query : 검색어, display : 한 번에 표시할 검색 결과 개수(기본값 10. 최댓값 100), sort : (sim 정확도순 내림차순(기본값), date 날짜 내림차순)
params = {'query': query, 'display': 100, 'sort': 'date'}
response = requests.get(news_url, headers=headers, params=params)
result = response.json()

# MySQL 연결 설정
db = pymysql.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASSWORD, database=DB_DATABASE) # 사용 DB 지정
cursor = db.cursor() # DB와 연결된 커서 객체 생성

# 'items' 라는 키와 리스트 형태의 값을 가진 딕셔너리 생성
csv_data = {'items': []}

# 이미지가 없는 경우 공백 지정
NoImage = ''

idx = 1

# 데이터 삽입
for item in result['items']:
    url = item['link']
    pubDate_str = item['pubDate']  # 기존 문자열 형식의 날짜
    pubDate_str = re.sub(r'\s\+\d{4}$', '', pubDate_str) # 날짜의 문자열에 있는 +0900 없애기
    pubDate = datetime.strptime(pubDate_str, "%a, %d %b %Y %H:%M:%S")  # 날짜 문자열을 datetime 객체로 변환
    
    url_pattern = re.compile(r'^https://n\.news\.naver\.com/mnews/article/.*') # 추출할 기사 url 정규표현식 지정
    

    if idx <= 20:
        if url_pattern.match(url):
            # url값의 HTTP GET 요청 후 응답을 변수에 저장
            response_article = requests.get(url)
            # .text: 응답받은 값 텍스트로 추출 / 'html.parser': Python 내장 HTML 파서
            soup = BeautifulSoup(response_article.text, 'html.parser')
            # 기사 본문 제목 가져오기
            title_tag = soup.find('h2', {'id': 'title_area'}) # h2 태그의 id 값이 title_area인 것 찾아서 변수에 저장
            # title_tag가 존재하면 텍스트화 시키고 좌우 공백 제거한 값을 title에 저장 title_tag가 없으면 item['title'] 저장
            title = title_tag.text.strip() if title_tag else item['title']
            # 기사 본문 텍스트 가져오기
            article_tag = soup.find('article', {'id': 'dic_area'})
            content = article_tag.text.strip() if article_tag else 'No Content'
            # 기사 본문 이미지 가져오기
            img_tag = soup.find('img', {'id': 'img1'})
            # img_tag가 존재하고 'data-src' 속성이 있다면
            if img_tag and 'data-src' in img_tag.attrs:
                image_url = img_tag['data-src'] # img_tag의 data-src 속성값을 변수에 저장
            else:
                image_url = NoImage
            # 데이터 삽입 쿼리 실행
            insert_query = "INSERT INTO news (image_url, title, url, pubDate) VALUES (%s, %s, %s, %s);" # %s는 쿼리 실행시 값 지정
            cursor.execute(insert_query, (image_url, title, url, pubDate)) # SQL 쿼리 실행
            csv_data['items'].append({'title': title, 'content': content})
            idx += 1
        else:
            continue
    else:
        break


# DB 변경사항 저장
db.commit()

# CSV 파일 생성 및 데이터 추가
csv_columns = ['title', 'content']
csv_rows = []

for item in csv_data['items']:
    onlyKorTitle = re.sub(r"[^가-힣\s]|\b있\w*|기자|기업", "", item['title']) # 한글이나 공백이 아닌것 "" 처리 해서 지움
    onlyKorContent = re.sub(r"[^가-힣\s]|\b있\w*|기자|기업", "", item['content']) # 한글이나 공백이 아닌것 "" 처리 해서 지움 
    csv_rows.append({'title': onlyKorTitle, 'content': onlyKorContent})

# CSV 파일명 지정
csv_file = 'news_data.csv'

# CSV 파일 생성
with open(csv_file, 'w', newline='', encoding='utf8') as csv_file:
    csv_writer = csv.DictWriter(csv_file, delimiter='|', quotechar="'", fieldnames=csv_columns)
    csv_writer.writeheader()
    csv_writer.writerows(csv_rows)

# 커서 및 연결 종료
cursor.close()
db.close()