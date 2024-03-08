from konlpy.tag import Okt # 한글 자연어 처리 라이브러리 / Okt : 트위터에서 개발한 형태소 분석기
from collections import Counter # 텍스트 데이터에서 각 단어의 빈도수 계산
from wordcloud import WordCloud # 텍스트 데이터에서 단어의 빈도수를 기반으로 워드클라우드를 생성
import matplotlib.pyplot as plt # 워드클라우드를 시각화하기 위해 사용되는 라이브러리
import pandas as pd # CSV 파일 등의 형태로 저장된 텍스트 데이터를 불러오고 다루기 위해 사용
import numpy as np
from PIL import Image # 이미지 처리를 위한 라이브러리

okt = Okt()
word_list = []

# csv파일 읽어오기(원하는 크롤링 결과 읽어오기)
newsList = pd.read_csv("news_data.csv", delimiter='|', encoding="utf-8-sig")

# 각 행의 'title' 열을 개별적으로 처리
for title in newsList['title']:
    # 형태소 분석 작업을 진행
    for word, tag in okt.pos(title):
        # 명사와 형용사만 추출
        if tag in ['Noun', 'Adjective'] and len(word) > 1:
            # 조건을 만족하는 단어들만 word_list 데이터셋에 추가
            word_list.append(word)
            
            
# 각 행의 'content' 열을 개별적으로 처리
for content in newsList['content']:
    # 형태소 분석 작업을 진행
    for word, tag in okt.pos(str(content)):
        # 명사와 형용사만 추출
        if tag in ['Noun', 'Adjective'] and len(word) > 1:
            # 조건을 만족하는 단어들만 word_list 데이터셋에 추가
            word_list.append(word)

# 동일 단어 횟수 추출
word_list_count = Counter(word_list) # 각 단어의 빈도수 추출 후 딕셔너리 형태로 저장
total_word_count = sum(word_list_count.values()) # 딕셔너리의 값들을 모두 합해서 총 단어 등장 횟수 계산npm 
print(word_list_count)
print(total_word_count)

# 마스크가 될 이미지 불러오기
icon = Image.open('./earth.png') # 사용할 이미지를 변수에 할당

mask = Image.new("RGB", icon.size, (255,255,255))
mask.paste(icon,icon) # icon 이미지를 새로 생성한 mask에 붙임
mask = np.array(mask) # mask를 numpy배열로 변환

# 색상 팔레트 정의
def color_func(word, font_size, position, **kwargs):
    if np.random.rand() < 0.5:  # 글자 색상을 50% 확률로 초록색과 파란색 계열로 나눔
        return "hsl(120, 100%, {}%)".format(np.random.randint(40, 70))  # 초록색 계열 (채도 100%)
    else:
        return "hsl(210, 100%, {}%)".format(np.random.randint(40, 70))  # 파란색 계열 (채도 100%)

# 워드클라우드 객체 선언 및 출력
wc =  WordCloud(font_path='malgun', width=400, height=400, background_color='white', mask=mask, color_func=color_func)
result = wc.generate_from_frequencies(word_list_count)
plt.axis('off') # 그래프 축 제거
plt.imshow(result)
wc.to_file("./my-app/public/wc_image/result.png") # png 파일로 저장