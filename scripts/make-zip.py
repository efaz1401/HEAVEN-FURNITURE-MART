#!/usr/bin/env python3
"""
Zip dist/ for upload, WITH explicit directory entries.

WHY THIS FILE EXISTS — a real deployment failure, twice over.

Two archivers on this machine produced zips that verified locally and then lost
files on the host:

  1. The `zip` binary is a minimal build. `zip -r -q -9 out.zip .` archived only
     the four root files, printed nothing, and exited 0 — a 12 KB "complete"
     archive of a 47 MB folder.

  2. PowerShell's Compress-Archive produced all 178 file entries but ZERO
     directory entries. That is legal ZIP, and Python, 7-Zip and Windows
     Explorer all create the parent folders implicitly when extracting. But
     Hostinger's File Manager extractor creates only entries it sees literally,
     so it wrote index.html, robots.txt, sitemap.xml and .htaccess and silently
     dropped css/, js/, data/, assets/ and all ten page directories. The site
     served unstyled HTML with every subfolder 404ing.

So: write the archive here, explicitly, adding a directory entry for every
folder before the files inside it. Python's zipfile does exactly what it is
told, and `verify()` below re-opens the result and asserts what a strict
extractor needs rather than what a lenient one tolerates.

Usage:  python scripts/make-zip.py [source_dir] [output.zip]
"""
import os
import sys
import zipfile

src = sys.argv[1] if len(sys.argv) > 1 else 'dist'
out = sys.argv[2] if len(sys.argv) > 2 else 'hfm-deploy.zip'

if not os.path.isdir(src):
    sys.exit(f'error: {src}/ does not exist — run scripts/build-deploy.sh first')

dirs, files = [], []
for root, dirnames, filenames in os.walk(src):
    for d in sorted(dirnames):
        # ZIP paths are always forward-slash and relative to the archive root,
        # and a directory entry must end in "/" to be recognised as one.
        rel = os.path.relpath(os.path.join(root, d), src).replace(os.sep, '/')
        dirs.append(rel + '/')
    for f in sorted(filenames):
        full = os.path.join(root, f)
        rel = os.path.relpath(full, src).replace(os.sep, '/')
        files.append((full, rel))

# Deflate everything. The WebP/JPEG/GLB/MP4 payload is already compressed so it
# barely shrinks, but mixing stored and deflated entries has caused trouble with
# other extractors and the CPU cost here is irrelevant.
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for d in sorted(dirs):
        z.writestr(zipfile.ZipInfo(d), b'')
    for full, rel in files:
        z.write(full, rel)


def verify(path, expected_files, expected_dirs):
    """Assert what a STRICT extractor needs, not what a lenient one tolerates."""
    with zipfile.ZipFile(path) as z:
        names = z.namelist()
        f = [n for n in names if not n.endswith('/')]
        d = [n for n in names if n.endswith('/')]
        problems = []
        if len(f) != expected_files:
            problems.append(f'{len(f)} files in archive, expected {expected_files}')
        if len(d) != expected_dirs:
            problems.append(f'{len(d)} dir entries, expected {expected_dirs}')
        if not d:
            problems.append('NO directory entries — this is the bug that broke the last deploy')
        if 'index.html' not in f:
            problems.append('index.html is not at the archive root')
        if not any(n.endswith('.htaccess') for n in f):
            problems.append('.htaccess missing')
        if any(chr(92) in n for n in names):
            problems.append('backslash path separators (must be forward slashes)')
        # Every file must have a declared parent directory entry.
        for n in f:
            if '/' in n:
                parent = n.rsplit('/', 1)[0] + '/'
                if parent not in d:
                    problems.append(f'no directory entry for {parent} (needed by {n})')
                    break
        if z.testzip() is not None:
            problems.append('CRC failure')
        return problems, len(f), len(d)


problems, nf, nd = verify(out, len(files), len(dirs))
size_mb = os.path.getsize(out) / 1048576

if problems:
    print('ARCHIVE REJECTED:')
    for p in problems:
        print('  -', p)
    sys.exit(1)

print(f'{out}  {size_mb:.1f} MB')
print(f'  {nf} files, {nd} directory entries')
print('  index.html at root, .htaccess present, forward-slash paths, CRC ok')
