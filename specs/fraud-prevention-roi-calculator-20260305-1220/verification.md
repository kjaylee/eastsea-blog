# Verification — Fraud Prevention ROI Calculator

## Syntax check
```
node --check tools/fraud-prevention-roi-calculator/script.js
```

## Local HTTP (200)
```
python3 -m http.server 8123 --directory /Users/kjaylee/.openclaw/workspace/eastsea-blog
curl -I http://localhost:8123/tools/fraud-prevention-roi-calculator/
```

Expected output:
```
HTTP/1.0 200 OK
Content-type: text/html
Content-Length: 8615
```
