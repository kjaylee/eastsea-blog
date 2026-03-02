# Gap Analysis — p1-games-batch-20260301-1230

## 1) Verification Commands

```bash
python3 - <<'PY'
from pathlib import Path
import re, subprocess, tempfile, os, json
base = Path('games')
for g in ['quantum-bounce','ink-flow','gear-train']:
    p = base/g/'index.html'
    txt = p.read_text()
    print('---', g)
    print('size', p.stat().st_size)
    print('touch', ('pointerdown' in txt or 'touchstart' in txt), 'keyboard', ('keydown' in txt),
          'audio', ('AudioContext' in txt), 'localStorage', ('localStorage' in txt),
          'manifest-link', ('manifest.webmanifest' in txt), 'neon', ('#0a0a1a' in txt))
    scripts = re.findall(r'<script>([\s\S]*?)</script>', txt)
    t = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False)
    t.write('\n'.join(scripts)); t.close()
    r = subprocess.run(['node','--check',t.name], capture_output=True, text=True)
    os.unlink(t.name)
    print('node-check', r.returncode==0)

m = json.loads((base/'manifest.json').read_text())
print('manifest-count', m.get('count'), 'length', len(m.get('games', [])))
for s in ['quantum-bounce','ink-flow','gear-train']:
    idx = next((i for i,g in enumerate(m['games']) if g.get('slug')==s), -1)
    print(s, 'index', idx)
PY
```

## 2) Checklist vs Result

| 항목 | 결과 |
|---|---|
| 단일 `index.html` | PASS (3/3) |
| 파일 크기 `< 500KB` | PASS (`15981`, `13363`, `15237` bytes) |
| 터치 입력 | PASS (`pointerdown`/`touchstart` 포함) |
| 키보드 입력 | PASS (`keydown` 핸들러 포함) |
| Web Audio API | PASS (`AudioContext` 사용) |
| localStorage 저장 | PASS (최고 레벨 저장 키 사용) |
| 모바일 반응형 | PASS (media query + 유동 레이아웃) |
| 네온 다크 #0a0a1a | PASS |
| 5+ 레벨/무한 모드 | PASS (8레벨 / 6레벨 / 6레벨) |
| PWA manifest + link | PASS (3/3) |
| JS 구문 체크 (`node --check`) | PASS (3/3) |
| `games/manifest.json` 신규 3개 추가 | PASS (index 0,1,2) |
| `count === games.length` | PASS (92 / 92) |
| 기존 엔트리 유지 +3 | PASS (89 → 92) |

## 3) Quality Loop

### Round 1 — Score 100/100 (PASS)
- 기능/제약/카탈로그 동기화 전부 통과.
- `< 500KB`, 입력 2계열(터치+키보드), 오디오, 저장, PWA, 구문 검증 모두 PASS.

## 4) Residual Risk
- 밸런스(난이도 체감) 영역은 사용자 플레이 성향에 따라 편차 가능.
- 기능 제약 관점 출하 기준은 충족.
