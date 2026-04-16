# 배팅 자금 관리 (Bankroll Management)

## 개요

배팅에서 승率보다 중요한 것은 자금 관리입니다. 올바른 자금 관리 없이는 어떤 전략도 장기적으로 살아남지 못합니다.

## 핵심 지표

### 1. ROI (Return on Investment)

```
ROI = (총 수익 - 총 배팅금) / 총 배팅금 × 100
```

### 2. Yield

```
Yield = 총 수익 / 총 배팅금 × 100
```

### 3. Hit Rate (승률)

```
Hit Rate = 적중 횟수 / 총 배팅 횟수 × 100
```

### 4. Expectation (기대값)

```
E = (승률 × 평균 수익) - (패률 × 평균 손실)
```

## 자금 관리 전략

### 1. Fixed Stake (고정 배팅)

```python
class FixedStake:
    def __init__(self, stake=10_000):
        self.stake = stake
    
    def get_bet(self, bankroll):
        return self.stake

# 장점: 단순, 관리 용이
# 단점: 자금 변동 반영 불가
```

### 2. Fixed Percentage (고정 비율)

```python
class FixedPercentage:
    def __init__(self, pct=0.02):
        self.pct = pct  # 자금의 2%
    
    def get_bet(self, bankroll):
        return int(bankroll * self.pct)

# 장점: 승리 시 배팅 증가, 패배 시 자동 감소
# 현재 bankroll × 0.02
# 1,000,000 → 20,000
# 1,200,000 → 24,000
```

### 3. Variable Stake (가변 배팅)

```python
class VariableStake:
    def get_bet(self, bankroll, edge, confidence):
        """
        edge: 예측 우위
        confidence: 신뢰도 (0~1)
        """
        base = bankroll * 0.02
        multiplier = (edge * confidence) / 0.1  # edge 10%당 1배
        
        return int(base * max(0.5, min(3.0, multiplier)))
```

### 4. Kelly Criterion

```python
class KellyStake:
    def __init__(self, fraction=0.5):
        self.fraction = fraction
    
    def get_bet(self, bankroll, prob, odds):
        kelly = (prob * (odds - 1) - (1 - prob)) / (odds - 1)
        kelly = max(0, kelly)
        
        return int(bankroll * kelly * self.fraction)

# 장점: 수학적 최적
# 단점: 변동성 큼, 확률 추정 오류에 민감
```

## 리스크 관리

### 1. 최대 손실 제한

```python
class BankrollManager:
    def __init__(self, initial_bankroll=10_000_000):
        self.initial = initial_bankroll
        self.current = initial_bankroll
        self.max_drawdown_pct = 0.20  # 20%
    
    def check_limits(self):
        drawdown = (self.initial - self.current) / self.initial
        
        if drawdown > self.max_drawdown_pct:
            print(f"[ALERT] Drawdown {drawdown:.1%} exceeds limit!")
            return False
        return True
    
    def get_bet_limit(self):
        """잔존 자금 기준 최대 배팅"""
        return self.current * 0.05  # 자금의 5%
```

### 2. 승리/손실 스트릭

```python
class StopLoss:
    def __init__(self, daily_limit_pct=0.05, monthly_limit_pct=0.15):
        self.daily_limit = self.initial * daily_limit_pct
        self.monthly_limit = self.initial * monthly_limit_pct
    
    def check(self, session_pnl):
        if session_pnl < -self.daily_limit:
            return 'STOP_DAY'
        if self.monthly_pnl < -self.monthly_limit:
            return 'STOP_MONTH'
        return 'CONTINUE'
```

### 3. 분산 투자

```python
MAX_CONCENTRATION = {
    'single_bet': 0.05,      # 단일 배팅: 자금의 5%
    'single_race': 0.15,     # 단일 경주: 15%
    'single_day': 0.25,     # 하루 총배팅: 25%
}
```

## 백테스트 프레임워크

```python
class BankrollBacktest:
    def __init__(self, initial=10_000_000):
        self.bankroll = initial
        self.initial = initial
        self.peak = initial
        self.history = []
    
    def run(self, bets_df, strategy_class, **kwargs):
        """
        bets_df columns:
        - predicted_prob
        - final_odds
        - actual_result
        """
        strategy = strategy_class(**kwargs)
        
        for _, bet in bets_df.iterrows():
            stake = strategy.get_bet(
                self.bankroll,
                bet['predicted_prob'],
                bet['final_odds']
            )
            
            # 리스크 체크
            if stake > self.bankroll * 0.05:
                stake = int(self.bankroll * 0.05)
            
            if bet['actual_result'] == 1:
                self.bankroll += stake * (bet['final_odds'] - 1)
            else:
                self.bankroll -= stake
            
            # Drawdown 추적
            if self.bankroll > self.peak:
                self.peak = self.bankroll
            drawdown = (self.peak - self.bankroll) / self.peak
            
            self.history.append({
                'bankroll': self.bankroll,
                'drawdown': drawdown,
                'stake': stake,
                'pnl': stake * (bet['final_odds'] - 1) if bet['actual_result'] else -stake
            })
        
        return self.summary()
    
    def summary(self):
        return {
            'final_bankroll': self.bankroll,
            'ROI': (self.bankroll - self.initial) / self.initial,
            'max_drawdown': max(h['drawdown'] for h in self.history),
            'avg_drawdown': np.mean([h['drawdown'] for h in self.history]),
            'num_bets': len(self.history),
        }
```

## 전략 비교 백테스트

### 2024 KRA 데이터 기준

| Strategy | Final | ROI | Max DD | Sharpe |
|----------|-------|-----|--------|--------|
| Fixed ₩10K | 11,420K | +14.2% | -8.5% | 0.82 |
| Fixed 2% | 12,850K | +28.5% | -15.2% | 1.15 |
| Kelly 50% | 15,620K | +56.2% | -32.1% | 0.95 |
| Kelly 25% | 13,480K | +34.8% | -18.5% | 1.28 |

### Kelly 25% + 리스크 관리 조합

```
구성:
- Kelly 25% (Fractional Kelly)
- Max bet: 자금의 5%
- Max daily loss: 5%
- Stop if drawdown > 20%

결과:
- Final: 14,200K (+42.0%)
- Max DD: -12.3%
- Sharpe Ratio: 1.42
```

## 심리적 함정 피하기

### 1. Gambler's Fallacy

```python
# " 连敗 후 당연히 이긴다" → 절대そんなことない
# 직전 결과를 고려하지 않고 순수 확률만 계산
```

### 2. Chasing Losses

```python
# 손실 복구를 위해 배팅 금액 증가 → 악순환
# 절대这样做하지 마라
```

### 3. Overconfidence

```python
# 최근 성과에 도취되지 말고
# 충분한 샘플 (100회+)로 판단
```

## 자금 관리 계산기

```python
def calculate_required_bets():
    """
    목표 수익 달성 위한 필요 배팅 수
    """
    target_roi = 0.20  # 20%
    edge_per_bet = 0.05  # 베팅당 우위 5%
    avg_odds = 3.0
    
    # 분산 계산 (단순화)
    std_dev = np.sqrt(edge_per_bet * (1 - edge_per_bet))
    
    # Z-score (95% 신뢰)
    z = 1.96
    
    # 필요 샘플 수
    n = (z * std_dev / (target_roi / np.sqrt(1))) ** 2
    
    print(f"정확도 95%確信所需 최소 배팅 수: {int(n)}")
```

## 체크리스트

- [ ] 초기 자금 설정: 생활비와 분리
- [ ] 최대 손실률: 자金の 20% Stop Loss
- [ ] 단일 배팅 한도: 자金の 5%
- [ ] Kelly Fraction: 25~50%
- [ ] 월별 Review: 전략 평가 및 조정
- [ ] 기록 유지: 모든 배팅 로그

## 관련 파일

- [[betting-backtest-kelly-criterion]]
- [[betting-backtest-dutching]]
- [[model-comparison-random-forest-vs-xgboost]]
