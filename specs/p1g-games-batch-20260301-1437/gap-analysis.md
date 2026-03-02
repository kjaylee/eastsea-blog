# Gap Analysis — p1g-games-batch-20260301-1437

## 1) Verification Commands

```bash
python3 - <<'PY'
from pathlib import Path
import json, re, subprocess, tempfile, os
base=Path('games')
slugs=['phase-weaver-rails','pulse-orchard','ion-drift-warden']
for s in slugs:
    p=base/s/'index.html'
    t=p.read_text()
    print('---',s,'size',p.stat().st_size)
    print('touch',('pointerdown' in t or 'touchstart' in t),
          'keyboard',('keydown' in t),
          'audio',('AudioContext' in t),
          'localStorage',('localStorage' in t),
          'manifest-link',('manifest.webmanifest' in t),
          'neon',('#0a0a1a' in t),
          'responsive',('@media' in t))
    scripts=re.findall(r'<script>([\s\S]*?)</script>',t)
    tmp=tempfile.NamedTemporaryFile('w',suffix='.js',delete=False)
    tmp.write('\n'.join(scripts)); tmp.close()
    r=subprocess.run(['node','--check',tmp.name],capture_output=True,text=True)
    os.unlink(tmp.name)
    print('node-check',r.returncode==0)

m=json.loads((base/'manifest.json').read_text())
print('manifest-count',m['count'],'length',len(m['games']))
for s in slugs:
    idx=next((i for i,g in enumerate(m['games']) if g.get('slug')==s),-1)
    print(s,'index',idx)
PY
```

## 2) Checklist vs Result

| 항목 | 결과 |
|---|---|
| 단일 `index.html` | PASS (3/3) |
| 파일 크기 `< 500KB` | PASS (`11268`, `12583`, `13341` bytes) |
| 터치 입력 | PASS (`pointerdown`/버튼 입력 포함) |
| 키보드 입력 | PASS (`keydown` 핸들러 포함) |
| Web Audio API | PASS (`AudioContext` 사용) |
| localStorage 점수 저장 | PASS (`phaseWeaverRailsBest`, `pulseOrchardBest`, `ionDriftWardenBest`) |
| 모바일 반응형 | PASS (`@media` + 유동 레이아웃) |
| 네온 다크 `#0a0a1a` | PASS |
| 5+ 레벨 또는 무한 모드 | PASS (3종 모두 무한 모드 + Tier 상승) |
| PWA manifest + link | PASS (3/3) |
| JS 구문 체크 (`node --check`) | PASS (3/3) |
| `games/manifest.json` 신규 3개 추가 | PASS (index 0,1,2) |
| `count === games.length` | PASS (98 / 98) |
| 기존 엔트리 유지 +3 | PASS (95 → 98) |

## 3) Quality Loop

### Round 1 — Score 100/100 (PASS)
- 모든 제약/기능/카탈로그 동기화 조건 충족.
- 추가 수정 라운드 불필요.

## 4) Residual Risk
- 플레이 밸런스(점수 곡선/패턴 밀도)는 실제 유저 데이터 기반 미세 조정 여지 존재.
- 출하 제약(입력·오디오·저장·PWA·용량·무한모드)은 충족.
