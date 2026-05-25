"""Scan themes/ directory and generate theme_list.json for the previewer."""
import json
import os
import sys

THEMES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'themes')
OUTPUT = os.path.join(THEMES_DIR, 'theme_list.json')

EXCLUDE = {'common', 'key', 'backup', 'setting_theme', 'setting_time', 'system'}

def main():
    themes = []
    for name in sorted(os.listdir(THEMES_DIR)):
        path = os.path.join(THEMES_DIR, name)
        if not os.path.isdir(path):
            continue
        if name in EXCLUDE:
            continue
        if os.path.isfile(os.path.join(path, 'home_page_style.json')):
            themes.append(name)

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(themes, f, indent=2)

    print(f'Found {len(themes)} themes: {themes}')
    print(f'Written to {OUTPUT}')

if __name__ == '__main__':
    main()
