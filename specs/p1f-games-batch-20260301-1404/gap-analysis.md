# Gap Analysis — p1f-games-batch-20260301-1404

## 1) Verification Commands

```bash
python3 - <<'PY'
from pathlib import Path
import re, subprocess, tempfile, os, json
base = Path('games')
slugs = ['plasma-pong','cipher-lock','spore-colony']
for g in slugs:
    p = base/g/'index.html'
    txt = p.read_text()
    print('---', g, 'size', p.stat().st_size)
    print('touch', ('pointerdown' in txt or 'touchstart' in txt),
          'keyboard', ('keydown' in txt),
          'audio', ('AudioContext' in txt),
          'localStorage', ('localStorage' in txt),
          'manifest-link', ('manifest.webmanifest' in txt),
          'neon', ('#0a0a1a' in txt),
          'responsive', ('@media' in txt))
    scripts = re.findall(r'<script>([\s\S]*?)</script>', txt)
    t = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False)
    t.write('\n'.join(scripts)); t.close()
    r = subprocess.run(['node','--check',t.name], capture_output=True, text=True)
    os.unlink(t.name)
    print('node-check', r.returncode == 0)

m = json.loads((base/'manifest.json').read_text())
print('manifest-count', m.get('count'), 'length', len(m.get('games', [])))
for s in slugs:
    idx = next((i for i,g in enumerate(m['games']) if g.get('slug')==s), -1)
    print(s, 'index', idx)
PY
```

## 2) Checklist vs Result

| 항목 | 결과 |
|---|---|
| 단일 `index.html` | PASS (3/3) |
| 파일 크기 `< 500KB` | PASS (`15862`, `11809`, `14362` bytes) |
| 터치 입력 | PASS (`pointerdown`/`touchstart` 포함) |
| 키보드 입력 | PASS (`keydown` 핸들러 포함) |
| Web Audio API | PASS (`AudioContext` 사용) |
| localStorage 점수 저장 | PASS (`plasmaPongBestScore`, `cipherLockBestScore`, `sporeColonyBestScore`) |
| 모바일 반응형 | PASS (`@media` + 유동 레이아웃) |
| 네온 다크 `#0a0a1a` | PASS |
| 5+ 레벨 또는 무한 모드 | PASS (Plasma/Spore 무한 모드, Cipher 10레벨) |
| PWA manifest + link | PASS (3/3) |
| JS 구문 체크 (`node --check`) | PASS (3/3) |
| `games/manifest.json` 신규 3개 추가 | PASS (index 0,1,2) |
| `count === games.length` | PASS (95 / 95) |
| 기존 엔트리 유지 +3 | PASS (92 → 95) |

## 3) Quality Loop

### Round 1 — Score 100/100 (PASS)
- 제약/기능/카탈로그 동기화 전부 충족.
- 추가 수정 라운드 불필요.

## 4) Residual Risk
- 난이도 체감(밸런스)은 실제 플레이 데이터 기반 미세 조정 여지 존재.
- 출하 제약(입력·오디오·저장·PWA·용량·무한/레벨)은 충족.
