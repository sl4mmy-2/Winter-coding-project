import requests
import subprocess
import time

from pathlib import Path


Path("dist").mkdir(exist_ok=True)

proc = subprocess.Popen(["python", "app.py"])

time.sleep(2)

response = requests.get("http://localhost:5001/")
with open("dist/index.html", "w") as f:
    f.write(response.text)

proc.terminate()
proc.wait()

print("Build complete! Static site in dist/")
