import os
import shutil
import glob
import re
import sys
import subprocess

OUT = 'dist'
ARCHIVE = 'hfm-deploy.zip'

if os.path.exists(OUT):
    shutil.rmtree(OUT)
if os.path.exists(ARCHIVE):
    os.remove(ARCHIVE)

os.makedirs(OUT, exist_ok=True)
print(f"staging -> {OUT}/")

# Root files
for f in ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '.htaccess', 'site.webmanifest']:
    if os.path.isfile(f):
        shutil.copy2(f, OUT)

# Code directories
for d in ['css', 'js', 'data']:
    if os.path.isdir(d):
        shutil.copytree(d, os.path.join(OUT, d))

# Page directories
for d in ['about', 'ar', 'bespoke', 'cart', 'checkout', 'collections', 'contact', 'materials', 'piece', 'room', 'showroom', 'thanks']:
    if os.path.isdir(d):
        shutil.copytree(d, os.path.join(OUT, d))

# Assets
os.makedirs(os.path.join(OUT, 'assets', 'img', 'og'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'assets', 'img', 'real'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'assets', 'models'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'assets', 'fonts'), exist_ok=True)

for f in glob.glob('assets/img/*.webp'):
    shutil.copy2(f, os.path.join(OUT, 'assets', 'img'))
if os.path.isfile('assets/img/favicon.svg'):
    shutil.copy2('assets/img/favicon.svg', os.path.join(OUT, 'assets', 'img'))
for icon in ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png']:
    p = os.path.join('assets', 'img', icon)
    if os.path.isfile(p):
        shutil.copy2(p, os.path.join(OUT, 'assets', 'img'))
if os.path.isfile('assets/img/apple-touch-icon.png'):
    shutil.copy2('assets/img/apple-touch-icon.png', os.path.join(OUT, 'apple-touch-icon.png'))
for f in glob.glob('assets/img/og/*.jpg'):
    shutil.copy2(f, os.path.join(OUT, 'assets', 'img', 'og'))
for f in glob.glob('assets/img/real/*.webp'):
    shutil.copy2(f, os.path.join(OUT, 'assets', 'img', 'real'))
for f in glob.glob('assets/models/*.glb'):
    shutil.copy2(f, os.path.join(OUT, 'assets', 'models'))
for f in glob.glob('assets/models/*.usdz'):
    shutil.copy2(f, os.path.join(OUT, 'assets', 'models'))
for f in glob.glob('assets/fonts/*.woff2'):
    shutil.copy2(f, os.path.join(OUT, 'assets', 'fonts'))
if os.path.isdir('assets/video'):
    os.makedirs(os.path.join(OUT, 'assets', 'video'), exist_ok=True)
    for f in glob.glob('assets/video/*.mp4'):
        shutil.copy2(f, os.path.join(OUT, 'assets', 'video'))

# Assertions
pngs = [p for p in glob.glob(f'{OUT}/assets/img/*.png') if not any(k in p for k in ['apple-touch-icon', 'icon-'])]
if pngs:
    sys.exit(f"ERROR: PNG masters leaked into {OUT}: {pngs}")

for bad in ['_ref', 'scripts', 'serve.mjs', 'README.md', 'HANDOFF.md']:
    if os.path.exists(os.path.join(OUT, bad)):
        sys.exit(f"ERROR: {bad} leaked into {OUT}")

print("Staging complete. Running make-zip.py...")
res = subprocess.run([sys.executable, 'scripts/make-zip.py', OUT, ARCHIVE])
if res.returncode != 0:
    sys.exit(res.returncode)

print("Deploy zip built successfully!")
