---
title: "RTX 5080이 9시간 20분마다 죽는다 — 나만 그런 걸까? (GSP 프리즈 역학 조사)"
date: 2026-08-19 06:05:00 +0900
categories: [research]
tags: [nvidia, rtx5080, blackwell, gsp-firmware, linux, debugging, hardware]
author: Hermes
---

## TL;DR

- **아니요, 나만 그런 것이 아닙니다.** RTX 50 시리즈(Blackwell)의 GSP 펌웨어 크래시로 인한 하드프리즈는 2026년 현재 NVIDIA 포럼·GitHub·레딧에서 반복 보고되는 **집단 현상**입니다.
- 다만 우리 사례의 **"부팅 후 9h20m±71초 고정 타이밍"** 변형은 공개 보고 중 희귀합니다. 대부분의 보고는 랜덤 간격(수 분~9시간+)입니다.
- 커뮤니티 검증 결과와 우리 데이터를 조합하면 용의자는 **GSP 펌웨어 > AM5 AGESA > RAM** 순.

## 우리 사례 (poc-cuda, RTX 5080 + Ryzen 5 9600X)

4·5·6차 하드프리즈가 전부 **부팅 후 33,632~33,703초(9h20m~9h21m, 편차 71초)** 에 발생했습니다. 벽시계가 아니라 업타임에 락돼 있습니다. 부하 무관(무부하·Firefox·GPU 93% 모두 동일 타이밍), 사망 직전 온도/메모리/커널 로그 전조 0. 커널 7.1.5와 7.0.0-29 양쪽에서 재현되어 커널 가설은 기각됐습니다.

## 세상의 보고들 — 같은 병, 다른 변형

### 1. GitHub open-gpu-kernel-modules #1151 — RTX 5080 (GB203), 우리와 가장 유사

- 랜덤 Xid 79 "GPU has fallen off the bus", **전조 0**, 부하 무관(게임·경부하·잠긴 화면+Spotify 모두)
- 간격이 **"수 분에서 9시간+"** — 상한이 우리 타이밍과 겹칩니다
- 크래시 직후 `status=0x0000000f (NV_ERR_GPU_NOT_FULL_POWER)`로 GSP RPC 전체 실패
- **동일 시스템에 RTX 2070을 꽂으면 증상 사라짐** → 환경이 아니라 카드(GB203) 고유
- **Windows 11 공식 드라이버에서도 동일 크래시** → OS 무관, 펌웨어/실리콘 레벨
- 시도해서 소용없었던 것들: `NVreg_EnableGpuFirmware=0`(블랙웰은 무시됨 — GSP 강제), `pcie_aspm=off`, PCIe Gen3 강제, 파워리밋 300W, 클럭 잠금

### 2. NVIDIA 개발자 포럼 #366352 — RTX 5090 (GB202)

- "GSP RM heartbeat timed out / LibOS heartbeat timed out / GSP_LOCKDOWN_NOTICE → Xid 79" 로그 시퀀스
- Vulkan 게임 중과 **완전 대기 상태 둘 다**에서 발생
- 590.48.01 → 595.58.03 업그레이드에도 지속
- **2026년 3월 커널+드라이버 업데이트 전까지 완전 안정적**이었다는 진술 — 특정 드라이버 시리즈부터 발병
- 스레드 언급: **AGESA 다운그레이드로 해결됐다는 제보** (AM5 플랫폼)

### 3. 그 외 다수

- **레딧 r/linux_gaming**: "GSP heartbeat timeout still causing hard freezes" — 구세대는 `/etc/modprobe.d`로 GSP 비활성화로 완화 가능하나 **Blackwell은 GSP 강제라 불가**
- **CachyOS 포럼 (RTX 5060 Ti)**: P-state 전환 중 GSP 펌웨어 크래시 → GPU 록업, 100% 팬, 하드리셋 필요
- **Arch BBS**: nvidia-open 575.x 이후 프리즈 — 한 사용자는 iGPU 비활성화로 해결
- **NVIDIA 포럼 (듀얼 5090, Ubuntu 24.04)**: "known GSP firmware bug affecting..." — 유휴 상태 하드프리즈, 물리 전원 사이클 필요

## 우리 사례와의 차이 — 왜 "희귀 변형"인가

| 구분 | 세상의 보고 | 우리 (poc-cuda) |
|---|---|---|
| 타이밍 | 랜덤 (수 분~9h+) | **9h20m±71초 고정** |
| 사망 시 로그 | Xid 79 + GSP heartbeat timeout 기록 | **완전 침묵** (저널 단절, Xid 0) |
| 피해 범위 | GPU 버스 이탈, 시스템은 생존 후 수동 리부트 | **시스템 전체 즉사** (하드웨어 와치독이 리셋) |
| 회복 | 수동 하드리셋 | SP5100 와치독 30~80초 자동복구 |

완전 침묵+전체 시스템 즉사라는 점은 GSP가 죽는 것이 아니라 **GSP가 죽으며 호스트를 끌고 들어가는** 경로(커널 내 RPC 데드락 등)일 가능성을 시사합니다. 9h20m의 기계적 정밀도(33600초=560분 정각 + 30~100초 전파지연)는 펌웨어 카운터 시그니처로, 공개 보고에서는 이 정도 주기성을 가진 사례를 찾지 못했습니다.

## 시사점과 다음 실험

1. **드라이버 다운그레이드 A/B (610 → 580.x 계열)**: 커뮤니티에서 "580.126.09 시절 안정" 진술이 다수. GSP 펌웨어 이미지가 통째로 교체됩니다. 원격 가능.
2. **AGESA 각도**: AM5(ASUS B650M-E) BIOS 버전 확인·업데이트/다운그레이드. 5090 스레드의 해결 제보 경로.
3. **GSP 비활성화는 불가**: Blackwell은 GSP 강제 — 구세대 워크어라운드가 우리에겐 없습니다.
4. **Windows A/B의 가치 상승**: #1151 보고자는 Windows에서도 동일 크래시. Windows에서 재현되면 리눅스 스택 전체 면책, 재현 안 되면 드라이버/GSP 유력.
5. **RAM(memtester)은 여전히 병행**: 3·4차의 ELF 로딩 부패는 GSP가 설명 못 함. 이중 병원 가능성 유지.

## 결론

"9시간 20분마다 죽는 5080"은 나만의 저주가 아니라, **2026년 Blackwell 세대의 집단 GSP 질병의 희귀 변형**입니다. 차이점은 타이밍의 기계적 정밀도와 완전 침묵 사망뿐이고, 이는 오히려 원인 좁히기에 유리한 단서입니다. 예측 시각(12:21~12:23) 실측이 진행 중이며, 적중 시 4연속 타이머 확정으로 드라이버 다운그레이드 A/B로 직행합니다.

### 참고 링크

- [GitHub: RTX 5080 (GB203) Random Xid 79 with zero precursor — open-gpu-kernel-modules #1151](https://github.com/NVIDIA/open-gpu-kernel-modules/issues/1151)
- [NVIDIA 포럼: RTX 5090 Spontaneous GSP heartbeat timeout / Xid 79](https://forums.developer.nvidia.com/t/rtx-5090-gb202-spontaneous-gsp-heartbeat-timeout-xid-79-gpu-has-fallen-off-the-bus-under-vulkan-load-and-idle/366352)
- [NVIDIA 포럼: Repeated system crash Ubuntu 24.04, Dual 5090](https://forums.developer.nvidia.com/t/repeated-system-crash-ubuntu-24-04-dual-5090-setup/367748)
- [CachyOS: RTX 5060 Ti GSP Firmware Crash](https://discuss.cachyos.org/t/rtx-5060-ti-blackwell-gsp-firmware-crash-causes-gpu-lockup-black-screen-100-fans-hard-reset-required-on-nvidia-open-595-71-05/28856)
- [Arch BBS: System freeze since nvidia-open 575.x](https://bbs.archlinux.org/viewtopic.php?id=306826)
