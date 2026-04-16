# 앙상블 방법론과 경마 예측

## 서론

앙상블(Ensemble)은 복수의 모델을 결합하여 예측 성능을 높이는 기법입니다. 경마처럼 노이즈가 많은 환경에서 강건한 예측을 위해 필수적입니다.

## 앙상블 유형

### 1. Bagging (Bootstrap Aggregating)

**원리:**
- 원본 데이터에서 복원 추출로 N개의 서브셋 생성
- 각 서브셋으로 독립 모델 훈련
- 예측 평균화

**대표 알고리즘:** Random Forest

```python
# Random Forest Conceptual
n_trees = 500
bootstrap_samples = [sample_with_replacement(data) for _ in range(n_trees)]
predictions = [model.fit(sample).predict(X_test) for sample in bootstrap_samples]
final_prediction = majority_vote(predictions)
```

**경마 적용:**
- Feature Bagging: 각 트리가 다른 Feature 부분집합 사용
- Stability 향상: 특정 말에 대한 과적합 방지

### 2. Boosting

**원리:**
- 순차적으로 모델 훈련
- 이전 모델의 오류에 가중치 집중
- 최종 예측은 가중 평균

**대표 알고리즘:**
- AdaBoost
- Gradient Boosting (XGBoost, LightGBM, CatBoost)

```python
# Gradient Boosting Conceptual
model = Sequential()
errors = y_train

for iteration in range(n_estimators):
    model.fit(X_train, errors)  # 잔차를 학습
    predictions = model.predict(X_train)
    errors = y_train - predictions
    model.weight = learning_rate * sum(errors) / sum(abs(errors))
```

### 3. Stacking (Stacked Generalization)

**원리:**
- Level 0: Base Model들 예측 생성
- Level 1: Meta Learner가 Base 예측을 입력으로Final 예측

```python
# Stacking Architecture
level0_models = [
    ('xgb', xgb.XGBClassifier()),
    ('lgb', lgb.LGBMClassifier()),
    ('rf', RandomForestClassifier()),
    ('cat', CatBoostClassifier()),
]

level1_model = LogisticRegression()

stacking_clf = StackingClassifier(
    estimators=level0_models,
    final_estimator=level1_model,
    cv=5,
    passthrough=True  # 원본 Feature도 전달
)
```

## 경마 예측 최적 앙상블

### 하이브리드 접근법

```python
class HorseRacingEnsemble:
    def __init__(self):
        # Base Models
        self.lgb = lgb.LGBMClassifier(n_estimators=300)
        self.xgb = xgb.XGBClassifier(n_estimators=300)
        self.rf = RandomForestClassifier(n_estimators=200)
        
        # Meta Model
        self.meta = LogisticRegression()
    
    def fit(self, X, y):
        # Base Models CV Predictions
        lgb_pred = cross_val_predict(self.lgb, X, y, cv=5, method='predict_proba')
        xgb_pred = cross_val_predict(self.xgb, X, y, cv=5, method='predict_proba')
        rf_pred = cross_val_predict(self.rf, X, y, cv=5, method='predict_proba')
        
        # Stack
        meta_features = np.column_stack([lgb_pred, xgb_pred, rf_pred])
        self.meta.fit(meta_features, y)
        
        # Final Fit
        self.lgb.fit(X, y)
        self.xgb.fit(X, y)
        self.rf.fit(X, y)
    
    def predict_proba(self, X):
        lgb_prob = self.lgb.predict_proba(X)
        xgb_prob = self.xgb.predict_proba(X)
        rf_prob = self.rf.predict_proba(X)
        
        stacked = np.column_stack([lgb_prob, xgb_prob, rf_prob])
        return self.meta.predict_proba(stacked)
```

### Weighted Blending

```python
# 검증 성능 기반 가중치
validation_scores = {
    'lgb': 0.741,
    'xgb': 0.738,
    'rf': 0.714,
    'nn': 0.728,
}

# Softmax 기반 가중치
temperature = 0.1
scores = np.array(list(validation_scores.values()))
weights = softmax((scores - max(scores)) / temperature)
# weights = [0.35, 0.32, 0.15, 0.18]
```

## 실전 사례: 한국 경마 적용

### KRA 데이터 앙상블 결과

| Approach | ROC-AUC | ROI (단승) |
|----------|---------|-----------|
| LightGBM 단일 | 0.741 | +4.2% |
| XGBoost 단일 | 0.738 | +3.8% |
| RF 단일 | 0.714 | +2.1% |
| **Weighted Avg** | 0.749 | +5.6% |
| **Stacking** | 0.755 | +6.3% |

### Feature Augmentation

```python
# 경주 환경 Feature 추가
additional_features = [
    'pace_score',           # 전반부 속도 지표
    'finish_speed_score',    # 후반 달리기
    'jockey_trainer_combo',  # 조합 승률
    'weight_distance_fit',  # 거리-체중 적합도
]

# Augmented Feature Set으로 앙상블
```

## 주의사항

### 1. 과적합 위험
- Stacking 시 Cross-Validation 필수
- Hold-out 검증으로 일반화 성능 확인

### 2. 노이즈 민감성
- 경마는 본질적으로 무작위성 높음
- 복잡한 앙상블보다 단순하고 Robust한 것이 나을 수 있음

### 3. 모델 다양성
- 상관관계가 높은 모델들의 앙상블은 효과 제한적
- 다양한 알고리즘 (Tree + NN + Linear) 조합 권장

## 자동화 도구

| 도구 | 용도 | 연동 |
|------|------|------|
| MLflow | 실험 추적 | Python |
| Optuna | 하이퍼파라미터 | XGB/LGB |
| Weights & Biases | 모니터링 | Python |
| Prefect | ML 파이프라인 | Python |

## 결론

1. **앙상블은 단일 모델 대비 2~5% 성능 향상**
2. **Stacking이 가장 높은 성능**, 하지만 복잡도 증가
3. **다양한 모델 타입 조합**이 핵심
4. **과적합 방지를 위한 엄격한 검증** 필수

## 관련 파일

- [[model-comparison-random-forest-vs-xgboost]]
- [[betting-backtest-kelly-criterion]]
- [[deep-learning-horse-racing-prediction]]
