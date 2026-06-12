import json

log_path = r'C:\Users\admin\.gemini\antigravity\brain\7ce21a57-c7d7-4fd6-8450-9cf8964d0d94\.system_generated\logs\transcript.jsonl'

found_index = False
found_style = False
found_app = False

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            step = json.loads(line)
            if step.get('type') == 'PLANNER_RESPONSE':
                for call in step.get('tool_calls', []):
                    func = call.get('function', {})
                    if func.get('name') in ['write_to_file', 'replace_file_content']:
                        args = func.get('arguments', '{}')
                        if isinstance(args, str):
                            try:
                                args = json.loads(args)
                            except:
                                continue
                        
                        target = args.get('TargetFile', '')
                        content = args.get('CodeContent') or args.get('ReplacementContent')
                        
                        if content:
                            if 'index.html' in target and not found_index:
                                with open('index_backup.html', 'w', encoding='utf-8') as out:
                                    out.write(content)
                                found_index = True
                                print('Extracted index_backup.html')
                                
                            if 'style.css' in target and not found_style:
                                with open('style_backup.css', 'w', encoding='utf-8') as out:
                                    out.write(content)
                                found_style = True
                                print('Extracted style_backup.css')
                                
                            if 'app.js' in target and not found_app:
                                with open('app_backup.js', 'w', encoding='utf-8') as out:
                                    out.write(content)
                                found_app = True
                                print('Extracted app_backup.js')
except Exception as e:
    print('Error:', e)
