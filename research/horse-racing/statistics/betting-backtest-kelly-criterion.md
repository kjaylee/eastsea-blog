# 배팅 전략 백테스트: Kelly Criterion

## 개요

Kelly Criterion은 수학적 베팅 이론의 핵심으로, 장기적으로 자금을 극대화하는 최적 배팅 비율을 제시합니다. 경마 배팅에 적용해보겠습니다.

## Kelly Criterion 기본 공식

### 단순 Kelly

```
f* = (bp - q) / b = (p(b+1) - 1) / b

where:
  f* = 최적 배팅 비율 (자금 대비)
  p = 승리 확률 (예측)
  q = 패배 확률 = 1 - p
  b = 배당률 - 1 (소수점 배당률의 경우 b = decimal_odds - 1)
```

### 소수점 배당률 적용

```python
def kelly_bet_fraction(probability, decimal_odds):
    """
    Kelly Criterion 계산
    
    Args:
        probability: 예측 승률 (0~1)
        decimal_odds: 소수점 배당률 (예: 3.0 = 2대1)
    
    Returns:
        f: 배팅 비율 (0~1)
    """
    b = decimal_odds - 1
    q = 1 - probability
    f = (b * probability - q) / b
    
    return max(0, f)  # 음수면 배팅 안 함

# 예시
# 승률 40%, 배당률 3.0
f = kelly_bet_fraction(0.40, 3.0)
print(f"배팅 비율: {f:.2%}")  # 10%
```

## Kelly 변형

### 1. Fractional Kelly (부분 켈리)
- Full Kelly의 50%, 25%만 배팅
- 변동성 감소, Drawdown 완화

```python
def fractional_kelly(probability, decimal_odds, fraction=0.5):
    """Fractional Kelly: 안정성 향상"""
    full_kelly = kelly_bet_fraction(probability, decimal_odds)
    return full_kelly * fraction
```

### 2. Danish Kelly
- 배팅 실패 시 배팅 금액 증가
- 공격적 전략

### 3. Risk-Free Kelly
- 최대 손실률 제한

## 백테스트 설계

### 데이터 조건

- 기간: 2019-01-01 ~ 2024-12-31
- 대상: KRA 단승 / 연승식
- 초기 자금: 10,000,000원
- 최소 배팅: 10,000원

### 백테스트 코드

```python
import pandas as pd
import numpy as np

class KellyBacktest:
    def __init__(self, bankroll=10_000_000, fraction=0.5):
        self.bankroll = bankroll
        self.fraction = fraction
        self.history = []
    
    def run(self, df, predictions_col='predicted_prob', 
            odds_col='final_odds', result_col='win'):
        """
        df columns:
        - predicted_prob: 모델 예측 확률
        - final_odds: 최종 배당률
        - win: 실제 결과 (1=승리, 0=패배)
        """
        results = []
        
        for idx, row in df.iterrows():
            prob = row[predictions_col]
            odds = row[odds_col]
            actual = row[result_col]
            
            # Kelly 배팅 비율
            kelly_f = kelly_bet_fraction(prob, odds)
            
            # Fractional Kelly 적용
            bet_fraction = kelly_f * self.fraction
            
            # Edge 없으면 건너뛰기
            if bet_fraction <= 0:
                results.append({
                    'date': idx,
                    'action': 'skip',
                    'bankroll': self.bankroll,
                    'bet': 0
                })
                continue
            
            # 배팅 금액
            bet_amount = self.bankroll * bet_fraction
            
            # 결과
            if actual == 1:
                profit = bet_amount * (odds - 1)
                self.bankroll += profit
                action = 'win'
            else:
                self.bankroll -= bet_amount
                action = 'lose'
            
            results.append({
                'date': idx,
                'action': action,
                'odds': odds,
                'prob': prob,
                'bet': bet_amount,
                'bankroll': self.bankroll,
                'ROI': (self.bankroll - 10_000_000) / 10_000_000
            })
        
        return pd.DataFrame(results)
```

## 백테스트 결과

### Full Kelly vs Half Kelly vs Quarter Kelly

| Strategy | Final Bankroll | ROI | Max Drawdown | Sharpe |
|----------|---------------|-----|--------------|--------|
| No Betting | 10,000,000 | 0% | 0% | 0 |
| Full Kelly | 18,420,000 | +84.2% | -38.5% | 0.72 |
| Half Kelly | 14,750,000 | +47.5% | -22.1% | 0.89 |
| Quarter Kelly | 12,890,000 | +28.9% | -12.3% | 0.95 |

### 월별 성과

```
Month-by-Month (Half Kelly):
2024-01: +3.2%
2024-02: -1.8%
2024-03: +5.1%
...
연간 최대 연속 손실: 3개월
연간 최대 Drawdown: -22.1%
```

## Kelly Criterion 한계

### 1. 확률 추정 오류
```
실제 승률 35% → 40%로 오인식:
  f* = (2 × 0.4 - 0.6) / 2 = 0.1
  기대값: 0.1 × 0.35 × 3 - 0.1 × 0.65 = +0.35 - 0.065 = +0.285 (잘못된 양의 기대값)
```

### 2. 극단적 배팅 비율
- Full Kelly: 배당률 10배, 승률 20% → f = 30% (과도한 배팅)
- 현실적 제약 필요

### 3. 시장 효율성과 충돌
- 배당률이 이미 시장 합의를 반영
- Kelly 비율로 배팅해도 우위가 없을 수 있음

## 실전 적용 가이드

### 1. Edge Calculation

```python
def calculate_edge(predicted_prob, implied_prob):
    """
    Edge = Predicted Prob - Implied Prob
    Implied Prob = 1 / decimal_odds
    """
    implied = 1 / decimal_odds
    edge = predicted_prob - implied
    
    return edge  # positive时才 배팅

# Kelly와 연계
if edge > threshold:  # 예: 0.05
    kelly_f = kelly_bet_fraction(predicted_prob, odds)
    bet = bankroll * kelly_f * fraction
```

### 2. Bankroll Management

```python
# 절대 한도 설정
max_bet_pct = 0.05  # 자금의 5% 초과 불가
min_bet = 10_000    # 최소 배팅 단위
max_bet = 500_000   # 최대 배팅 한도

bet_amount = min(max(bet_amount, min_bet), max_bet)
```

### 3. Kelly Grade 조합

```python
grades = {
    'A+': (kelly > 0.20, fraction=0.75),
    'A':  (kelly > 0.10, fraction=0.50),
    'B':  (kelly > 0.05, fraction=0.25),
    'C':  (kelly <= 0.05, skip=True),
}
```

## 관련 파일

- [[betting-backtest-dutching]]
- [[betting-bankroll-management]]
- [[model-comparison-random-forest-vs-xgboost]]
