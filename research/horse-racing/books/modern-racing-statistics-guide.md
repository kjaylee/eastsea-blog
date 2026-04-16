# 현대 경마 통계 분석 가이드 (Modern Racing Statistics Guide)

## 서적 개요

| 항목 | 내용 |
|------|------|
| 제목 | Modern Race Analysis |
| 저자 | Andrew M. Tinder |
| 출판년도 | 2021 |
| 장르 | 경마 데이터 과학 |
| 난이도 | 고급 |

## 핵심 개념

### 1. 베이지안 분석법
경마 예측에 베이지안 통계학을 적용하는 방법론.

```
P(레이서A 승리 | 조건) = P(조건 | 레이서A 승리) × P(레이서A 승리) / P(조건)
```

### 2. 고급 지표들

| 지표 | 설명 | 활용도 |
|------|------|--------|
| Speed Figure | 레이서의 속도 수치화 | 高 |
| Class Rating | 마체 등급 평가 | 高 |
| Pace Figure | 전반기 속도 지표 | 中 |
| Recency Weight | 최근 성적 가중치 | 高 |

### 3. 실전 모델링

#### 회귀 분석 모델
```python
# 의사코드
winning_probability = f(
    recent_form,
    class_rating,
    distance_affinity,
    trainer_record,
    jockey_record,
    track_condition
)
```

#### 머신러닝 적용
- 랜덤 포레스트로 특성 중요도 분석
- 로지스틱 회귀로 승률 예측
- 시계열 분석으로 트렌드 포착

## 한국 경마 적용 시 고려사항

1. **데이터 수집**: KRA 공식 API 또는 웹 스크래핑
2. **과거 데이터 기간**: 최소 3년치 권장
3. **변수 선택**: 한국 환경에 맞는 변수 재정의 필요

## 핵심 포인트

> "통계는 도구일 뿐이다. 데이터를 해석하는 능력이 핵심." — Andrew M. Tinder

## 평가

| 항목 | 점수 |
|------|------|
| 이론적 깊이 | ★★★★★ |
| 실전 코드 | ★★★★☆ |
| 한국 적용 | ★★★☆☆ |

---

*관련 문서: [경마 통계학 개론](../statistics/racing-statistics-primer.md), [데이터 분석 도구](../apps-services/racing-analytics-tools.md)*
