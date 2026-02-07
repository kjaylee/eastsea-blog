#!/usr/bin/env python3
"""
Generate sprite sheets from individual PNG frames and create sprite-atlas.json
"""

import os
import json
from PIL import Image

# Configuration
SOURCE_DIR = "/Volumes/workspace/unity-assets/Sprite/Super Grotto Escape Pack/Assets/Super Grotto Escape/Characters"
OUTPUT_DIR = "/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/sprite-preview/sprites"
FRAME_WIDTH = 32
FRAME_HEIGHT = 38

# Character animations configuration
# Format: folder_name: (animation_name, frames, fps)
PLAYER_CONFIG = [
    ("Player-idle", "idle", 6, 8),
    ("player-run", "run", 6, 10),
    ("Player-jump", "jump", 2, 12),
    ("Player-Hurt", "hurt", 2, 10),
    ("Player-duck", "duck", 3, 8),
    ("Player-shoot", "shoot", 3, 10),
    ("Player-run-shoot", "run-shoot", 6, 10),
    ("Player-spin", "spin", 8, 12),
    ("Player-Slide", "slide", 1, 15),
    ("Player-Ladder", "ladder", 4, 8),
]

enemy_configs = [
    ("Bat", "bat", 5, 10),
    ("Ghost", "ghost", 4, 8),
    ("Ghost-fury", "ghost-fury", 2, 12),
    ("Ghost-shocked", "ghost-shocked", 1, 10),
    ("Skeleton-IDle", "skeleton-idle", 4, 8),
    ("Skeleton-Walk", "skeleton-walk", 8, 10),
    ("Slime", "slime", 5, 8),
    ("fly-eye", "fly-eye", 4, 8),
    ("lizard moves", "lizard-move", 3, 8),
    ("lizard shoots", "lizard-shoot", 4, 8),
]


def create_sprite_sheet(frames_dir, output_path, frame_count):
    """Combine individual frames into a single sprite sheet (horizontal layout)"""
    frames = []
    
    # Get all PNG files sorted by name
    png_files = sorted([f for f in os.listdir(frames_dir) if f.endswith('.png')])
    
    # Take only frame_count frames
    for png_file in png_files[:frame_count]:
        img_path = os.path.join(frames_dir, png_file)
        img = Image.open(img_path)
        frames.append(img)
    
    if not frames:
        return False
    
    # Create sprite sheet (horizontal)
    total_width = FRAME_WIDTH * len(frames)
    sprite_sheet = Image.new('RGBA', (total_width, FRAME_HEIGHT))
    
    for i, frame in enumerate(frames):
        sprite_sheet.paste(frame, (i * FRAME_WIDTH, 0))
    
    # Save sprite sheet
    sprite_sheet.save(output_path, 'PNG')
    print(f"Created: {output_path} ({len(frames)} frames)")
    return True


def generate_sprite_atlas():
    """Generate sprite-atlas.json configuration"""
    characters = {}
    
    # Process Player animations
    player_animations = {}
    for folder_name, anim_name, frame_count, fps in PLAYER_CONFIG:
        folder_path = os.path.join(SOURCE_DIR, "Player", folder_name)
        if os.path.exists(folder_path):
            png_files = [f for f in os.listdir(folder_path) if f.endswith('.png')]
            actual_frames = len(png_files)
            player_animations[anim_name] = {
                "frames": min(frame_count, actual_frames),
                "frameWidth": FRAME_WIDTH,
                "frameHeight": FRAME_HEIGHT,
                "fps": fps,
                "sheet": f"{anim_name}.png"
            }
    
    characters["player"] = {"animations": player_animations}
    
    # Process Enemy animations
    for folder_name, anim_key, frame_count, fps in enemy_configs:
        folder_path = os.path.join(SOURCE_DIR, "Enemies", folder_name)
        if os.path.exists(folder_path):
            png_files = [f for f in os.listdir(folder_path) if f.endswith('.png')]
            actual_frames = len(png_files)
            
            # Create animation entry for each enemy type
            enemy_animations = {}
            
            # Handle enemies with single animation
            if folder_name in ["Bat", "Ghost", "Ghost-fury", "Ghost-shocked", "Slime", "fly-eye"]:
                enemy_animations["idle"] = {
                    "frames": min(frame_count, actual_frames),
                    "frameWidth": FRAME_WIDTH,
                    "frameHeight": FRAME_HEIGHT,
                    "fps": fps,
                    "sheet": f"{anim_key}-idle.png"
                }
            # Enemies with multiple animations
            elif folder_name == "Skeleton-IDle":
                enemy_animations["idle"] = {
                    "frames": 4,
                    "frameWidth": FRAME_WIDTH,
                    "frameHeight": FRAME_HEIGHT,
                    "fps": 8,
                    "sheet": "skeleton-idle.png"
                }
            elif folder_name == "Skeleton-Walk":
                enemy_animations["walk"] = {
                    "frames": 8,
                    "frameWidth": FRAME_WIDTH,
                    "frameHeight": FRAME_HEIGHT,
                    "fps": 10,
                    "sheet": "skeleton-walk.png"
                }
            elif folder_name == "lizard moves":
                enemy_animations["move"] = {
                    "frames": min(frame_count, actual_frames),
                    "frameWidth": FRAME_WIDTH,
                    "frameHeight": FRAME_HEIGHT,
                    "fps": fps,
                    "sheet": "lizard-move.png"
                }
            elif folder_name == "lizard shoots":
                enemy_animations["shoot"] = {
                    "frames": min(frame_count, actual_frames),
                    "frameWidth": FRAME_WIDTH,
                    "frameHeight": FRAME_HEIGHT,
                    "fps": fps,
                    "sheet": "lizard-shoot.png"
                }
            
            # Use appropriate character name
            char_name = anim_key.replace("-", "_")
            characters[char_name] = {"animations": enemy_animations}
    
    # Save JSON
    atlas_path = os.path.join(OUTPUT_DIR, "sprite-atlas.json")
    with open(atlas_path, 'w') as f:
        json.dump({"characters": characters}, f, indent=2)
    
    print(f"Created: {atlas_path}")
    return characters


def main():
    print("=" * 60)
    print("Unity Sprite Asset to HTML Preview Generator")
    print("=" * 60)
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Process Player animations
    print("\nProcessing Player animations...")
    for folder_name, anim_name, frame_count, fps in PLAYER_CONFIG:
        folder_path = os.path.join(SOURCE_DIR, "Player", folder_name)
        if os.path.exists(folder_path):
            output_path = os.path.join(OUTPUT_DIR, f"{anim_name}.png")
            create_sprite_sheet(folder_path, output_path, frame_count)
    
    # Process Enemy animations
    print("\nProcessing Enemy animations...")
    for folder_name, anim_key, frame_count, fps in enemy_configs:
        folder_path = os.path.join(SOURCE_DIR, "Enemies", folder_name)
        if os.path.exists(folder_path):
            # Handle different enemy types differently
            if folder_name == "Skeleton-IDle":
                output_path = os.path.join(OUTPUT_DIR, "skeleton-idle.png")
                create_sprite_sheet(folder_path, output_path, 4)
            elif folder_name == "Skeleton-Walk":
                output_path = os.path.join(OUTPUT_DIR, "skeleton-walk.png")
                create_sprite_sheet(folder_path, output_path, 8)
            elif folder_name == "lizard moves":
                output_path = os.path.join(OUTPUT_DIR, "lizard-move.png")
                create_sprite_sheet(folder_path, output_path, 3)
            elif folder_name == "lizard shoots":
                output_path = os.path.join(OUTPUT_DIR, "lizard-shoot.png")
                create_sprite_sheet(folder_path, output_path, 4)
            elif folder_name in ["Bat", "Ghost", "Ghost-fury", "Ghost-shocked", "Slime", "fly-eye"]:
                output_path = os.path.join(OUTPUT_DIR, f"{anim_key}-idle.png")
                create_sprite_sheet(folder_path, output_path, frame_count)
    
    # Generate sprite atlas JSON
    print("\nGenerating sprite-atlas.json...")
    characters = generate_sprite_atlas()
    
    print("\n" + "=" * 60)
    print("Done! Sprite sheets and JSON created.")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 60)
    
    # Print summary
    print("\nCharacters summary:")
    for char_name, char_data in characters.items():
        print(f"  - {char_name}: {len(char_data['animations'])} animations")
        for anim_name, anim_data in char_data['animations'].items():
            print(f"      {anim_name}: {anim_data['frames']} frames @ {anim_data['fps']}fps")


if __name__ == "__main__":
    main()
