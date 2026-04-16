# 신경망 기반 배당률 분석 연구

## 서론

배당률은 시장이 형성한 "집단 지성"으로, 경마 예측에 귀중한 정보를 담고 있습니다. 신경망을 통해 배당률에 숨겨진 정보를 추출하는 연구가 활발합니다.

## 연구 프레임워크

### Market Efficiency 가설
- 배당률은 경마ファンの集団判断을 반영
- 완전 효율 시장은 아님 → 예측 가능성 존재
- **역설**: 많은 사람이 동일 정보에 반응 → 오히려 패턴 발생

## 신경망 아키텍처

### 1. Multi-Layer Perceptron (MLP)
```
Input(12) → Dense(64) → ReLU → Dense(32) → Softmax(3)
Input: 최근 배당률 변동, 개시 배당률, 환율 등
Output: 1위 / 2~3위 / 4위 이하 분류
```

### 2. 배당률 인코딩 방식

| 방식 | 설명 | 효과 |
|------|------|------|
| Raw Odds | 원본 배당률 | 직관적이나 범위 차이 큼 |
| Log Odds | log(배당률) | 정규분포에 근사 |
| Implied Probability | 1/배당률 | 마권 확률 변환 |
| Odds Change | Δ배당률 | 시장 움직임 포착 |

### 3. LSTM for Odds Time Series
- 배당률이 최종적으로 확정되기까지 수시간 소요
- 확정 과정 자체가 정보 처리 과정
- **연구 결과**: 확정 전 30분 배당률이 가장 예측력 높음

## 실증 연구 결과

### 실험 설계
- 데이터: KRA (한국마사회) 2019~2024 경주
- 모델: LSTM + Feature Engineering
- 지표: ROC-AUC, Profit Factor

### 핵심 발견

1. **배당률 변동 폭**이 단독 순위보다 예측력 높음
2. **초기 배당률 대비 최종 배당률** 비율이 시장 신호
3. **热门马 배당률 조작** 여부 탐지 가능성

### 정량 결과

| 지표 | MLP | LSTM | Transformer |
|------|-----|------|-------------|
| Top-1 정확도 | 34.2% | 36.8% | 38.1% |
| Top-3 정확도 | 71.5% | 73.2% | 74.6% |
| ROI (단승) | +3.2% | +5.7% | +7.1% |

## Market Making 모델과의 연계

### Sharp's Model 확장
- 배당률 = 내재 확률 + 마진
- 신경망으로 마진 제거 → 순수 예측 확률 추출

### 베팅 전략 최적화
- Predicted Probability vs Implied Probability
- Gap이 positive일 때 베팅 → Expected Value 발생

## 주의사항

1. **데이터 스누핑(Data Snooping)**: 과거 데이터에 과적합 위험
2. **실시간성**: 배당률은 경주 직전에 가장 효율적
3. **검증 방법**: Walk-Forward Analysis 필수

## 관련 파일

- [[deep-learning-horse-racing-prediction]]
- [[betting-backtest-kelly-criterion]]
