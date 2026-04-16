# 경주마 가속도계·GPS 추적 기술

## 개요

경주마에 장착하는 센서 기술은 경기력 분석, 부상 예방, 트레이닝 최적화에 혁신을 가져오고 있습니다. MEMS 센서와 GNSS 기술의 소형화로 실전 적용이加速하고 있습니다.

## 센서 시스템 구성

### 1. 관성 측정 장치 (IMU)

```
IMU 구성:
├── 3-axis Accelerometer (가속도)
├── 3-axis Gyroscope (자이로)
├── Magnetometer (지자계) - 선택
└── Barometer (기압) - 선택
```

**제원:**
- 가속도: ±16g 범위, 16-bit resolution
- 자이로: ±2000°/s 범위
- 샘플링: 100~1000 Hz
- 무게: 30~80g (마 적용 가능 수준)

### 2. GPS/GNSS 모듈

| 방식 | 정확도 | 지연 | 비용 |
|------|--------|------|------|
| GPS 단독 | ±2~5m | 10Hz | 저가 |
| GPS + GLONASS | ±1~3m | 10Hz | 중가 |
| RTK-GPS | ±0.02m | 20Hz | 고가 |
| UWB | ±0.1m | 100Hz | 고가 |

## 주요 추적 지표

### 속도 프로파일

```python
# 속도 데이터 처리
speed_profile = {
    'max_speed': max(gps_velocity),
    'avg_speed': mean(gps_velocity),
    'speed_variance': std(gps_velocity),
    'acceleration_events': count_peaks(acceleration),
    'deceleration_rate': min(acceleration),
}
```

### 거리·트랙 분석

- **전체 거리**: GPS 적분으로 정확한 경주 거리 계산
- **트랙 위치**: 코너 vs 직선 구간 속도 비교
- **심판과의 거리**: RaceFlow 분석

### 분당 보폭 (Stride Rate)

```
Stride Rate = Stride Count / Race Duration
Stride Length = Distance / Stride Count
```

## 상품 및 서비스

### 상용 제품

| 제품 | 회사 | 특징 | 가격 |
|------|------|------|------|
| equiRatings | equiRatings | 종합 분석 | 구독 |
| Hippo | Hippo Technology | 실시간 GPS | $500/개월 |
| Stride | PetPacer | 소형 가속도계 | $299 |
| K능 | 서울대학교 | 국내 개발 | 연구용 |

### 실시간 시스템 아키텍처

```
[마背上 센서] 
    │ Bluetooth/Lora
    ▼
[레시버 (트레일러/관중석)]
    │ LTE/5G
    ▼
[클라우드 서버]
    │ API
    ▼
[모바일 앱 / 팬덤]
```

## 데이터 분석 기법

### 경주 단계 분류

```python
# 기기 학습 기반 구간 분류
race_phases = {
    'start': acceleration > threshold,
    'mid_race': velocity > 15 m/s,
    'final_stretch': position == final_400m,
    'finish': speed < 5 m/s,
}
```

###疲労 감지

- 후반 구간 속도 저하율: >10% 시 Fatigue 신호
- 보폭 단축 패턴: 부상 또는 체력 저하 징후
- 심박수 급등: 회복 실패

### Form Score 산출

```python
def calculate_form_score(gps_data, biometric_data):
    speed_score = percentile_rank(max_speed, historical)
    consistency_score = 1 / speed_variance
    finish_score = final_400m_speed / avg_speed
    
    return (speed_score * 0.4 + 
            consistency_score * 0.3 + 
            finish_score * 0.3)
```

## 데이터 포맷

### 표준 구조

```json
{
  "timestamp": "2024-03-15T14:30:00Z",
  "horse_id": "KOR-2023-001",
  "gps": {
    "lat": 37.2856,
    "lon": 127.0456,
    "altitude": 85.3,
    "speed": 17.2,
    "heading": 45.2
  },
  "imu": {
    "accel": [0.12, -0.05, 9.81],
    "gyro": [0.01, 0.02, -0.01]
  },
  "biometric": {
    "heart_rate": 185
  }
}
```

## 법적 이슈

### 개인정보 보호
- 말 데이터는 개인정보 해당 안 됨
- 그러나 예진 데이터와 연계 시 민감 정보 가능성

### 스포츠 규정
- 일부 경마협회: 센서 장착 허용 (특정 위치만)
- 국제경마총연맹(IFHA): Guidelines 수립 중

## 향후 전망

1. **5G 통합**: 20Hz 이상의 실시간 전송
2. **AI 추론**: Edge AI로 센서 자체 분석
3. **디지털 트윈**: 말의 가상 모델 구축
4. **입체 추적**: 드론과 협력하는 입체적 추적

## 관련 파일

- [[gait-motion-analysis]]
- [[heart-rate-recovery-analysis]]
- [[data-viz/race-replay-visualization]]
