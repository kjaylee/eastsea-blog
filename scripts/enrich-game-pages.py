#!/usr/bin/env python3
"""
enrich-game-pages.py
AdSense 심사 통과를 위한 게임 페이지 콘텐츠 강화 스크립트

- 각 games/*/index.html에 game-info 섹션 추가
- meta description 고유하게 업데이트
- 이미 game-info 섹션이 있으면 스킵 (멱등성)
"""

import os
import re
import sys
from pathlib import Path

# ── 장르 키워드 → 설명 매핑 ──────────────────────────────────────────────
GENRE_MAP = [
    # 디펜스/전략
    (["siege", "defense", "defence", "tower", "protect", "fortress", "bastion",
      "guard", "sentinel", "barricade", "rampart"],
     "전략 디펜스",
     "적의 공격으로부터 기지를 지키는 전략 디펜스 게임입니다. 타워와 방어 시설을 업그레이드하며 점점 강해지는 웨이브를 막아내세요."),

    # 퍼즐
    (["puzzle", "match", "merge", "connect", "chain", "swap", "flip", "rotate",
      "tile", "block", "tetris", "jigsaw", "maze", "logic"],
     "퍼즐",
     "두뇌를 자극하는 퍼즐 게임입니다. 요소들을 연결하고 조합하여 레벨을 클리어하세요. 간단한 규칙 속에 깊은 전략이 숨어 있습니다."),

    # 농장/시뮬레이션/경영
    (["farm", "craft", "build", "colony", "city", "village", "harvest",
      "tycoon", "factory", "empire", "kingdom", "manage", "idle",
      "resource", "trade", "harbor", "ledger", "forge"],
     "시뮬레이션",
     "자원을 수집하고 시설을 건설하는 경영 시뮬레이션 게임입니다. 전략적 판단으로 번영하는 제국을 만들어 나가세요."),

    # 달리기/액션/점프
    (["dash", "run", "jump", "hop", "sprint", "fly", "chase", "escape",
      "dodge", "avoid", "ninja", "rider", "racer", "pilot", "slide"],
     "액션",
     "빠른 반응 속도가 필요한 액션 게임입니다. 장애물을 피하고 목표를 향해 끊임없이 달려 나가세요."),

    # 슈팅
    (["shooter", "shoot", "bullet", "cannon", "laser", "blast", "fire",
      "sniper", "gun", "missile", "bomb", "invader", "alien", "asteroid"],
     "슈팅",
     "적을 조준하고 격파하는 슈팅 게임입니다. 다양한 무기와 파워업을 활용해 밀려드는 적들을 물리치세요."),

    # 생존/로그라이크
    (["survival", "survivor", "roguelike", "dungeon", "crawl", "quest",
      "rogue", "loot", "hero", "warrior", "knight", "adventure"],
     "생존 어드벤처",
     "위험한 환경에서 살아남는 생존 게임입니다. 아이템을 수집하고 능력을 강화하며 최대한 오래 버텨내세요."),

    # 탑다운/RPG
    (["rpg", "arena", "battle", "fight", "combat", "duel", "arena",
      "warrior", "monster", "boss", "dungeon", "spell", "magic",
      "arcane", "alchemist"],
     "배틀 아레나",
     "전투 전략이 핵심인 배틀 게임입니다. 적과의 싸움에서 승리하기 위해 스킬과 장비를 최적화하세요."),

    # 퍼즐/아카이브/수집
    (["archive", "curator", "vault", "collect", "sort", "organize",
      "memory", "card", "deck", "artifact"],
     "수집 퍼즐",
     "아이템을 수집하고 분류하는 퍼즐 게임입니다. 관찰력과 전략적 사고로 모든 수집품을 완성하세요."),

    # 음악/리듬
    (["music", "rhythm", "beat", "accordion", "piano", "sound", "melody",
      "song", "note"],
     "리듬",
     "음악의 리듬에 맞춰 플레이하는 게임입니다. 음악의 흐름을 타며 최고 점수를 노려보세요."),

    # 우주/항법
    (["space", "star", "galaxy", "cosmic", "orbit", "planet", "lunar",
      "astro", "nebula", "cosmos", "meteor", "comet", "aurora"],
     "우주 탐험",
     "광활한 우주를 배경으로 펼쳐지는 게임입니다. 별들 사이를 누비며 미지의 공간을 탐험하세요."),

    # 물고기/해양
    (["fish", "ocean", "sea", "aqua", "marine", "abyssal", "deep",
      "coral", "wave", "tide"],
     "해양 어드벤처",
     "신비로운 바다 세계를 탐험하는 게임입니다. 깊은 바다 속 생물들과 만나며 모험을 이어가세요."),

    # 철도/교통
    (["rail", "train", "track", "subway", "transit", "road", "traffic",
      "bridge", "route"],
     "교통 관리",
     "교통과 경로를 관리하는 전략 게임입니다. 효율적인 노선 설계로 최고의 교통망을 구축하세요."),

    # 낚시
    (["fish", "fishing", "catch", "hook", "bait", "reel", "cast"],
     "낚시",
     "여유로운 낚시를 즐기는 게임입니다. 다양한 물고기를 낚으며 컬렉션을 완성해 보세요."),

    # 세포/생물
    (["cell", "cellular", "bacteria", "virus", "organism", "bio", "gene",
      "evolve", "evolution"],
     "세포 전략",
     "세포와 생명체를 다루는 전략 게임입니다. 성장과 진화를 거듭하며 세계를 정복하세요."),

    # 원소/화학
    (["amber", "crystal", "gem", "ore", "element", "aether", "pollen",
      "auric", "mineral", "alchemy"],
     "연금술 어드벤처",
     "신비로운 원소와 연금술을 활용한 게임입니다. 재료를 조합하고 변환하며 목표를 달성하세요."),
]

GENRE_DEFAULT = (
    "HTML5",
    "브라우저에서 바로 즐길 수 있는 캐주얼 게임입니다. 간단한 조작으로 누구든 쉽게 시작할 수 있으며, 플레이할수록 더 깊은 재미를 느낄 수 있습니다."
)


def detect_genre(game_slug: str, game_title: str) -> tuple[str, str]:
    """게임 슬러그와 제목에서 장르와 설명을 추출"""
    combined = (game_slug + " " + game_title).lower()
    words = re.findall(r'[a-z]+', combined)
    word_set = set(words)

    for keywords, genre_label, description in GENRE_MAP:
        if any(kw in word_set for kw in keywords):
            return genre_label, description

    return GENRE_DEFAULT


def detect_features(html_content: str) -> dict:
    """HTML 내용을 분석하여 게임 특성 감지"""
    content_lower = html_content.lower()
    return {
        "canvas":       bool(re.search(r'<canvas', content_lower)),
        "touch":        bool(re.search(r'touchstart|touchmove|touchend', content_lower)),
        "keyboard":     bool(re.search(r"addeventlistener\(['\"]key|keydown|keyup|keypress", content_lower)),
        "click":        bool(re.search(r"click|tap", content_lower)),
        "score":        bool(re.search(r'\bscore\b|점수', content_lower)),
        "level":        bool(re.search(r'\blevel\b|\bstage\b|레벨|스테이지', content_lower)),
        "save":         bool(re.search(r'localstorage', content_lower)),
        "multiplayer":  bool(re.search(r'websocket|multiplayer|멀티플레이', content_lower)),
    }


def build_game_section(game_title: str, game_slug: str, features: dict) -> str:
    """게임 콘텐츠 섹션 HTML 생성"""
    genre_label, genre_desc = detect_genre(game_slug, game_title)

    # 조작 방법 리스트
    controls = []
    if features["keyboard"]:
        controls.append("방향키 또는 WASD로 이동 및 조작")
    if features["click"]:
        controls.append("마우스 클릭 또는 화면 탭으로 조작")
    if features["touch"]:
        controls.append("모바일 터치 제스처 지원")
    if not controls:
        controls.append("화면을 클릭하거나 탭하여 시작")

    controls_html = "\n    ".join(f"<li>{c}</li>" for c in controls)

    # 게임 특징 리스트
    feat_items = ["100% 무료 — 설치 없이 브라우저에서 바로 플레이"]
    if features["score"]:
        feat_items.append("점수 시스템으로 실력을 기록하고 최고 기록에 도전하세요")
    if features["level"]:
        feat_items.append("다양한 레벨과 스테이지에 도전하세요")
    if features["save"]:
        feat_items.append("자동 저장 — 언제든 이어서 플레이")
    if features["multiplayer"]:
        feat_items.append("멀티플레이어 지원 — 친구와 함께 즐기세요")
    feat_items.append("PC와 모바일 모두 지원")

    feat_html = "\n    ".join(f"<li>{f}</li>" for f in feat_items)

    section = f"""
<section class="game-info" style="max-width:780px;margin:20px auto;padding:20px;font-family:'Pretendard','Noto Sans KR',system-ui,sans-serif;color:#e0e0e0;line-height:1.7;background:rgba(0,0,0,0.3);border-radius:12px">
  <h2 style="font-size:20px;margin-bottom:12px;color:#fff">{game_title} — 무료 브라우저 게임</h2>
  <p>{game_title}은(는) 브라우저에서 바로 플레이할 수 있는 무료 HTML5 {genre_label} 게임입니다. 다운로드 없이 PC와 모바일 모두에서 즐길 수 있습니다.</p>

  <h3 style="font-size:16px;margin-top:16px;color:#4fc3f7">🎮 조작 방법</h3>
  <ul style="padding-left:20px;margin-top:8px">
    {controls_html}
  </ul>

  <h3 style="font-size:16px;margin-top:16px;color:#4fc3f7">✨ 게임 특징</h3>
  <ul style="padding-left:20px;margin-top:8px">
    {feat_html}
  </ul>

  <h3 style="font-size:16px;margin-top:16px;color:#4fc3f7">📖 게임 소개</h3>
  <p>{genre_desc}</p>
  <p>eastsea.monster에서 {game_title} 외에도 350개 이상의 무료 브라우저 게임을 즐길 수 있습니다. <a href="/games/" style="color:#4fc3f7;text-decoration:none">전체 게임 목록 보기 →</a></p>
</section>"""
    return section


def build_meta_description(game_title: str, game_slug: str, features: dict) -> str:
    """게임별 고유 meta description 생성"""
    genre_label, _ = detect_genre(game_slug, game_title)

    feat_parts = []
    if features["keyboard"]:
        feat_parts.append("키보드")
    if features["click"] or features["touch"]:
        feat_parts.append("마우스/터치")
    ctrl_str = "와 ".join(feat_parts) + "로 조작" if feat_parts else "간단한 조작"

    extras = []
    if features["save"]:
        extras.append("진행 저장 지원")
    if features["score"]:
        extras.append("점수 경쟁")
    if features["level"]:
        extras.append("다양한 레벨")
    extra_str = (", ".join(extras) + "." if extras else ".")

    return (
        f"무료 {genre_label} 게임 {game_title}을(를) 브라우저에서 바로 플레이하세요. "
        f"{ctrl_str}하며 {extra_str} 다운로드 없이 PC·모바일 모두 지원."
    )


def process_file(filepath: Path) -> str:
    """단일 파일 처리. 결과: 'skipped', 'processed', 'error:...'"""
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception as e:
        return f"error:read:{e}"

    # 이미 처리된 파일 스킵
    if 'class="game-info"' in content:
        return "skipped"

    # </body> 없으면 스킵
    if "</body>" not in content:
        return "error:nobody"

    # 게임 이름 추출
    title_match = re.search(r'<title>([^<]+)</title>', content, re.IGNORECASE)
    if not title_match:
        return "error:notitle"
    game_title = title_match.group(1).strip()

    # 게임 슬러그 (디렉토리명)
    game_slug = filepath.parent.name

    # 특성 감지
    features = detect_features(content)

    # meta description 업데이트
    new_desc = build_meta_description(game_title, game_slug, features)
    new_meta = f'<meta name="description" content="{new_desc}">'

    # 기존 meta description 교체
    content_updated = re.sub(
        r'<meta\s+name="description"\s+content="[^"]*"\s*/?>',
        new_meta,
        content,
        flags=re.IGNORECASE
    )

    # game-info 섹션 삽입 (</body> 바로 앞)
    section_html = build_game_section(game_title, game_slug, features)
    content_final = content_updated.replace("</body>", f"{section_html}\n</body>", 1)

    try:
        filepath.write_text(content_final, encoding="utf-8")
    except Exception as e:
        return f"error:write:{e}"

    return "processed"


def main():
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    games_dir = repo_root / "games"

    if not games_dir.exists():
        print(f"ERROR: games dir not found: {games_dir}", file=sys.stderr)
        sys.exit(1)

    game_files = sorted(games_dir.glob("*/index.html"))
    print(f"Found {len(game_files)} game files")

    processed = 0
    skipped = 0
    errors = []

    for fp in game_files:
        result = process_file(fp)
        if result == "processed":
            processed += 1
            if processed % 50 == 0:
                print(f"  [{processed}] processed so far...")
        elif result == "skipped":
            skipped += 1
        else:
            errors.append(f"{fp.parent.name}: {result}")

    print(f"\n✅ 처리 완료:")
    print(f"   처리됨  : {processed}")
    print(f"   스킵    : {skipped}")
    print(f"   에러    : {len(errors)}")
    if errors:
        print("\n⚠️  에러 목록:")
        for e in errors[:20]:
            print(f"   {e}")


if __name__ == "__main__":
    main()
