# 경주마 보행·동작(Gait & Motion) 분석

## 서론

경주마의 보행 패턴과 동작 특성은 근골격계 건강, 추진 효율성, 그리고 경기력을 직접적으로 반영합니다. Kinematics(운동학) 및 Kinetics(동역학) 분석이 발전하고 있습니다.

## 보행 분류

### 기본 보행 (Gaits)

| 보행 | 설명 | 속도 | 사용 상황 |
|------|------|------|----------|
| Walk | 느린 지팡이 보행 | 1.5~2.5 m/s | 훈련, 산책 |
| Trot | 경쾌한 떠름 | 3.5~5.0 m/s | 마과 훈련 |
| Canter | 느린 속주 | 5.5~8.0 m/s | 웜업, 조정 |
| Gallop | 전속력 질주 | 12~20 m/s | 경주 |

### 경주용 보행 특징

- **Lead Change**: 좌·우 앞발 전환 빈도
- **Stride Length**: 보폭 (경주마 6~7m)
- **Cadence**: 보행 빈도 (분당 보폭 수)

## 동작 분석 시스템

### 주요 센서 기술

#### 1. 가속도계 (Accelerometer)
```python
# 3축 가속도 데이터 처리
acceleration = sqrt(ax^2 + ay^2 + az^2)
stride_detection = peak_detection(acceleration)
```

#### 2. 자이로스코프 (Gyroscope)
- 몸통의 회전 운동 측정
- Roll/Pitch/Yaw 추적

#### 3. GPS 추적
- 위치 정확도: ±0.5m (RTK-GPS)
- 속도 계산: 미분 값
- 트랙 내 위치 추적

### 주요 측정 지표

| 지표 | 정상 범위 | 이상 징후 |
|------|----------|----------|
| Stride Length | 6.0~7.5m | 감소 시 피로/부상 |
| Stride Frequency | 2.0~2.5 Hz | 과도 시 체력 저하 |
| Peak Force | 12~15 kN |不对称 시 보행 이상 |
| Ground Contact Time | 120~150ms | 연장 시 추진력 저하 |

## 연구 동향

### Kinetic Analysis (힘 분석)

#### Ground Reaction Force (지반 반력)
- 각 말발이 지면에 가하는 힘 측정
- 경주 중 4개 발의 분배 패턴

```
Total Force = F_forefoot + F_hindfoot
Asymmetry Index = (F_left - F_right) / Total Force
```
- **0.1 이상**: 운동학 전문가 상담 필요

### Kinematic Analysis (운동학)

#### 고속 영상 분석
- 1000fps 이상의 고속 카메라
- 관절 각도 추적 (어깨, 무릎, 경첩)
- 발 착지 시점 정밀 측정

#### 주요 각도 지표

| 부위 | 정상 범위 | 설명 |
|------|----------|------|
| Shoulder Angle | 90~110° | 추진 시 확장 |
| Knee Flexion | 30~50° | 질주 시 굴곡 |
| Back Hoof Angle | 15~25° | 착지 자세 |

## 실전 활용

### 부상 조기 발견

#### Lameness Detection
- 고르게 보행 시 뒷다리 리듬 변화
- Head Bob 패턴 분석 (앞발问题时 head nod)
- **정확도**: 숙련兽医 대비 85% 수준

### 성능 최적화

#### Stride Efficiency
```
Efficiency = (Speed^2) / (Heart Rate * Stride Rate)
```
- 같은 속도에서 심박수가 낮을수록 효율적
- 트레드밀 테스트로 개인 벤치마크 설정

### 조기 경고 시스템

```
Red Flag Algorithm:
  IF stride_length_decrease > 15% over 3 races
  AND asymmetry_index > 0.12
  THEN alert: potential injury risk
```

## 주요 연구 논문

1. **Harrison et al. (2020)**: " inertial measurement units for lameness detection"
2. **Williams & Norris (2021)**: " Biomechanical differences between elite and standard racehorses"
3. **한국 경마공원 연구 (2023)**: GPS 추적 기반 보폭 분석

## 관련 파일

- [[heart-rate-recovery-analysis]]
- [[accelerometer-gps-tracking]]
- [[training/conditioning-programs]]
