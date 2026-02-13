import os
import socket

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

new_ip = get_ip()
print(f"Detected IP: {new_ip}")

# Replace patterns
patterns = [
    "10.183.118.172",
    "10.243.228.172",
    "192.168.", # Partial match for common LAN IPs if needed
    "localhost:8080",
    "127.0.0.1:8080"
]

root_dirs = [
    r"c:\JAVA Springboard Internship\current work 06\SmartParkingSpot_Frontend\SmartParkingSpot_Frontend-main",
    r"c:\JAVA Springboard Internship\current work 06\smartParkingProjectFontendandBackend-main\frontend",
    r"c:\JAVA Springboard Internship\current work 06\smartParkingProjectFontendandBackend-main\backend\src\main\java\com\parkease\backend\config" # For CorsConfig
]

for root_dir in root_dirs:
    print(f"Processing directory: {root_dir}")
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith((".ts", ".tsx", ".java")):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    for old_pattern in patterns:
                        if old_pattern in content:
                            if ":" in old_pattern: # Replace with IP only if it had port
                                content = content.replace(old_pattern, f"{new_ip}:8080")
                            else:
                                content = content.replace(old_pattern, new_ip)
                    
                    if content != original_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Updated: {file_path}")
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
