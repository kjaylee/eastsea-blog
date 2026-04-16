# 심층 학습(Deep Learning) 기반 경주마 성적 예측 연구 분석

## 개요

심층 학습은 경마 예측에서 전통적인 기계학습보다 복잡한 패턴을 포착하는 데 강점을 보입니다. CNN, RNN, LSTM 등 다양한 구조가 연구되어 왔습니다.

## 주요 연구 동향

### 1. CNN 기반 경주 패턴 인식
- **입력 데이터**: 최근 5경주 성적, 거리 적응도, 체중 변화
- **아키텍처**: 1D-CNN + Fully Connected Layer
- **정확도**: 약 68~72% (상위 3위 예측)
- **한계**: 시계열 의존성 처리에 RNN 대비 제한적

### 2. LSTM/GRU 기반 시계열 분석
```python
# 논문 기반 Conceptual 구조
model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(timesteps, features)),
    Dropout(0.3),
    LSTM(64),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')  # 1위 예측
])
```
- **장점**: 경주의 시간적 의존성 학습 가능
- **적용 사례**: 최근 10경주의 순위 변동 추적

### 3. Attention Mechanism 도입
- Transformer 기반 구조로 경주별 중요도 자동 가중치 부여
- 특정 경주의 영향을 강조하여 예측 설명력 향상

## 핵심 변수 Importance

| 순위 | 변수 | 설명 |
|------|------|------|
| 1 | 최근 3경주 평균 순위 |直近战绩 |
| 2 | 거리 적합도 | 동일 거리 전적 |
| 3 | 기수 교체 여부 | 新騎手 배치 |
| 4 | 체중 증감 | 馬体状態 |
| 5 | 경주 간 휴식 일수 | 回復期間 |

## 최신 연구 (2023~2025)

### Hong Kong Jockey Club 연구
- 2024년 발표: LSTM + Attention 모델
- AUROC 0.78 달성
- 실시간 배당률과의 연계로 수익률 8% 향상

### 일본 JRA 데이터 분석
- XGBoost와 LSTM 앙상블
- 단승 예측 정확도 71.2%
- 복승 예측으로 확장 시 85% 이상

## 실전 적용 시 고려사항

1. **데이터 품질**: 경주 결과 ही 아닌, 중간 상황(말的位置) 데이터 활용
2. **과적합 방지**: Dropout, Early Stopping 필수
3. **변수 엔지니어링**: 경주 환경(날씨, 트랙 상태) 인코딩
4. **실시간 반영**: 학습된 모델의 Drift 감지 및 재학습

## 참고 논문

- Benter et al. (2005) - "Computer Based Horse Race Betting"
- Bolton & Chapman (1986) - "Searching for Positive Returns"
-内装: These papers established statistical foundations for modern ML approaches

## 관련 파일

- [[neural-network-odds-analysis]]
- [[model-comparison-random-forest-vs-xgboost]]
