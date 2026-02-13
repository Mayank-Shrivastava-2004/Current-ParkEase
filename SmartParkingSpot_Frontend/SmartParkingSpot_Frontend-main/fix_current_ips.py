import os

new_ip = "10.67.158.172"
old_ips = ["10.183.118.172", "10.243.228.172"]

# Current directory is the frontend project
root_dir = os.getcwd()
app_dir = os.path.join(root_dir, "app")

print(f"Target IP: {new_ip}")
print(f"Searching in: {app_dir}")

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith((".ts", ".tsx")):
            file_path = os.path.join(root, file)
            try:
                # Try reading with different encodings
                content = None
                for encoding in ['utf-8-sig', 'utf-8', 'latin-1']:
                    try:
                        with open(file_path, 'r', encoding=encoding) as f:
                            content = f.read()
                        break
                    except:
                        continue
                
                if content is None:
                    print(f"Could not read {file_path}")
                    continue

                original_content = content
                for old_ip in old_ips:
                    content = content.replace(old_ip, new_ip)
                
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated: {file_path}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

print("Done!")
