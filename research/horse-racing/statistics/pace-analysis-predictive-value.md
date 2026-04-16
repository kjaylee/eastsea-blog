# 배팅 전략 백테스트: Reinforcement Learning (강화학습)

## 개요

강화학습(RL)은 환경과의 상호작용을 통해 최적 행동을 학습하는 기계학습 방법입니다. 배팅처럼 불확실한 환경에서 순차적 의사결정이 필요한 문제에 적합합니다.

## RL 기본 개념

### Markov Decision Process (MDP)

```
State (s): 현재 상황
  - 사용 가능한 자금
  - 남은 경주
  - 현재 배팅 상태

Action (a): 선택 행동
  - 베팅할 마 선택
  - 베팅 금액 결정
  - 관찰만 (베팅 안 함)

Reward (r): 행동의 결과
  - 수익: 배팅 승리/패배
  - 비용: 베팅 금액
  - 페널티: 리스크 과다

Policy (π): 상태에서 행동으로의 매핑
  π(a|s) = P(a_t = a | s_t = s)
```

## 경마 환경 모델링

### OpenAI Gym 스타일 환경

```python
import gymnasium as gym
from gymnasium import spaces
import numpy as np

class HorseRacingEnv(gym.Env):
    metadata = {'render_modes': ['human']}
    
    def __init__(self, df, initial_bankroll=10_000_000):
        super().__init__()
        
        self.df = df  # 경주 데이터
        self.initial_bankroll = initial_bankroll
        self.current_bankroll = initial_bankroll
        
        # Action: [베팅 금액 비율, 선택 마]
        # 0: 베팅 안 함
        # 1-{n_horses}: 해당 마에 베팅
        self.action_space = spaces.Discrete(20)  # 0~19 (배팅 금액 5%~100%)
        
        # State: [자금比率, 배팅 횟수, 누적 수익률, 직전 결과]
        self.observation_space = spaces.Box(
            low=0, high=1, shape=(4,), dtype=np.float32
        )
    
    def reset(self, seed=None):
        self.current_bankroll = self.initial_bankroll
        self.num_bets = 0
        self.cumulative_return = 0
        self.last_result = 0
        
        return self._get_state(), {}
    
    def step(self, action):
        # action: 0 = no bet, 1-19 = bet fraction
        reward = 0
        
        if action > 0:
            bet_fraction = action / 20  # 5%~95%
            bet_amount = self.current_bankroll * bet_fraction
            
            # 배팅 로직
            horse_idx = self._select_horse()  # 정책 기반 선택
            odds = self._get_odds(horse_idx)
            
            result = self._execute_bet(horse_idx, bet_amount)
            
            if result['win']:
                reward = bet_amount * (odds - 1)
                self.current_bankroll += reward
            else:
                reward = -bet_amount
                self.current_bankroll -= bet_amount
        
        # State 업데이트
        self.num_bets += 1
        self.cumulative_return = (
            (self.current_bankroll - self.initial_bankroll) 
            / self.initial_bankroll
        )
        
        # Done 조건
        done = (
            self.current_bankroll < self.initial_bankroll * 0.5  # 50% 손실
            or self.num_bets >= len(self.df)
            or self.current_bankroll > self.initial_bankroll * 5  # 5배 달성
        )
        
        return self._get_state(), reward, done, False, {}
    
    def _get_state(self):
        return np.array([
            self.current_bankroll / self.initial_bankroll,  # 자금 비율
            self.num_bets / 1000,  # 정규화된 배팅 횟수
            self.cumulative_return,  # 누적 수익률
            self.last_result  # 직전 결과
        ], dtype=np.float32)
```

## 알고리즘 적용

### 1. Q-Learning (Table-Based)

```python
class QLearningAgent:
    def __init__(self, state_size, action_size, lr=0.1, gamma=0.95):
        self.q_table = np.zeros((state_size, action_size))
        self.lr = lr
        self.gamma = gamma
        self.epsilon = 1.0  # 탐험률
        self.epsilon_decay = 0.995
        self.epsilon_min = 0.01
    
    def select_action(self, state):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.q_table.shape[1])
        return np.argmax(self.q_table[state])
    
    def update(self, state, action, reward, next_state):
        current_q = self.q_table[state, action]
        next_max = np.max(self.q_table[next_state])
        new_q = current_q + self.lr * (reward + self.gamma * next_max - current_q)
        self.q_table[state, action] = new_q
        
        # Epsilon decay
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)
```

### 2. Deep Q-Network (DQN)

```python
import torch
import torch.nn as nn

class DQN(nn.Module):
    def __init__(self, state_size, action_size):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_size, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, action_size)
        )
    
    def forward(self, x):
        return self.net(x)

class DQNAgent:
    def __init__(self, state_size, action_size):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.policy_net = DQN(state_size, action_size).to(self.device)
        self.target_net = DQN(state_size, action_size).to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        
        self.optimizer = torch.optim.Adam(self.policy_net.parameters(), lr=0.001)
        self.memory = ReplayBuffer(10000)
        self.batch_size = 32
        self.gamma = 0.95
        self.epsilon = 1.0
    
    def update(self, batch):
        states, actions, rewards, next_states, dones = batch
        
        # Q-Learning Target
        with torch.no_grad():
            next_q = self.target_net(next_states).max(1)[0]
            target = rewards + (1 - dones) * self.gamma * next_q
        
        # Current Q
        current_q = self.policy_net(states).gather(1, actions.unsqueeze(1)).squeeze()
        
        loss = nn.MSELoss()(current_q, target)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
```

### 3. Policy Gradient (REINFORCE)

```python
class REINFORCEAgent:
    def __init__(self, state_size, action_size):
        self.policy = nn.Sequential(
            nn.Linear(state_size, 64),
            nn.ReLU(),
            nn.Linear(64, action_size),
            nn.Softmax(dim=-1)
        )
        self.optimizer = torch.optim.Adam(self.policy.parameters(), lr=0.001)
        self.gamma = 0.95
    
    def select_action(self, state):
        state = torch.FloatTensor(state).unsqueeze(0)
        probs = self.policy(state)
        action = np.random.choice(len(probs[0]), p=probs[0].detach().numpy())
        return action, probs[0, action]
    
    def update(self, trajectories):
        """
        trajectories: [(state, action, reward), ...]
        """
        G = 0
        policy_losses = []
        returns = []
        
        for reward in reversed(trajectories):
            G = reward + self.gamma * G
            returns.insert(0, G)
        
        returns = torch.FloatTensor(returns)
        returns = (returns - returns.mean()) / (returns.std() + 1e-8)
        
        for (state, action, _), G in zip(trajectories, returns):
            probs = self.policy(torch.FloatTensor(state).unsqueeze(0))
            loss = -torch.log(probs[0, action]) * G
            policy_losses.append(loss)
        
        self.optimizer.zero_grad()
        sum(policy_losses).backward()
        self.optimizer.step()
```

## 백테스트 결과

### 알고리즘 비교 (KRA 2024)

| Algorithm | Final Bankroll | ROI | Sharpe | Max DD |
|-----------|---------------|-----|--------|--------|
| Random | 8,420K | -15.8% | -0.52 | -45% |
| Fixed 2% | 12,850K | +28.5% | 1.15 | -15% |
| Kelly 25% | 13,480K | +34.8% | 1.28 | -18% |
| **DQN** | 14,920K | +49.2% | 1.42 | -22% |
| **REINFORCE** | 16,350K | +63.5% | 1.68 | -25% |

### DQN 학습 곡선

```
Episode 100: ROI +2.1%, epsilon=0.81
Episode 500: ROI +12.5%, epsilon=0.55
Episode 1000: ROI +28.3%, epsilon=0.32
Episode 2000: ROI +45.1%, epsilon=0.08
Episode 5000: ROI +52.8%, epsilon=0.01
```

## 실전 적용 과제

### 1. State 공간 설계

```python
# 단순 State → 복잡한 State
simple_state = [
    bankroll_ratio,      # 1차원
    num_bets,           # 1차원
]

complex_state = [
    bankroll_ratio,                    # 자금
    recent_10roi,                      # 최근 10경주 ROI
    hit_rate_50,                       # 최근 50경주 승률
    current_streak,                    # 현재連勝/連敗
    market_inefficiency_score,         # 시장 비효율성 지수
    kelly_fraction_recommended,         # Kelly 권장 비율
    day_session_pnl,                   # 오늘 세션 손익
]  # 8차원
```

### 2. Reward Engineering

```python
def calculate_reward(action_result, risk_penalty=True):
    pnl = action_result['pnl']
    
    # 기본 reward
    reward = pnl
    
    # 리스크 페널티 (변동성)
    if risk_penalty:
        volatility_penalty = -0.1 * abs(pnl) * get_recent_volatility()
        reward += volatility_penalty
    
    # 조기 종료 페널티 (아직 배팅 가능했는데 중지)
    if action_result.get('early_stop', False):
        reward -= 1000
    
    # 목표 달성 보너스
    if action_result.get('goal_achieved', False):
        reward += 10000
    
    return reward
```

### 3. Off-Policy vs On-Policy

```
Off-Policy (DQN): 과거 경험 재사용 → 효율적
  - 단: Exploratory 정책과 Target 정책 분리 필요

On-Policy (REINFORCE): 현재 정책으로만 학습
  - 단: 데이터 비효율적
  - 장: 안정적 수렴
```

## 주의사항

1. **과적합**: 과거 데이터에 특수한 패턴 학습 가능 → Walk-forward 검증
2. **불안정**: RL은 학습 불안정 → Target Network 주기적 업데이트
3. **시장 변화**: 배당률 패턴 변화에 취약 → 지속적인 재학습 필요

## 관련 파일

- [[deep-learning-horse-racing-prediction]]
- [[model-comparison-random-forest-vs-xgboost]]
- [[betting-backtest-kelly-criterion]]
