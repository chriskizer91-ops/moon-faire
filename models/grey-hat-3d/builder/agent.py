# Runs one building stage with a second Claude through the API. This script holds the key; the builder's shell never sees it.
# usage: python3 agent.py <brief.md> <run_name> [max_turns]
import anthropic, base64, io, json, os, subprocess, sys, time
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
WORK = '/home/claude/moon-faire/models/grey-hat-3d'
brief, run = open(sys.argv[1]).read(), sys.argv[2]
MAX_TURNS = int(sys.argv[3]) if len(sys.argv) > 3 else 140
MODEL, EFFORT = 'claude-fable-5-2', 'high'
client = anthropic.Anthropic(api_key=open(HERE + '/.key').read().strip(), max_retries=6, timeout=1800)
LOG, STATUS, SAVE = f'{HERE}/{run}.log', f'{HERE}/{run}.status.json', f'{HERE}/{run}.messages.json'
ENV = {k: v for k, v in os.environ.items() if 'KEY' not in k.upper() and 'TOKEN' not in k.upper()}

TOOLS = [
    {'name': 'bash', 'description': 'Run a shell command. The working directory is the model folder unless you cd. Output over 9000 characters is cut in the middle. Slow commands: give timeout_s (up to 900).',
     'input_schema': {'type': 'object', 'properties': {'command': {'type': 'string'}, 'timeout_s': {'type': 'integer'}}, 'required': ['command']}},
    {'name': 'read_file', 'description': 'Read a text file with line numbers. Give offset (first line, from 1) and limit (lines) for long files; default is the first 400 lines. Long lines are cut at 1200 characters unless full_lines is true.',
     'input_schema': {'type': 'object', 'properties': {'path': {'type': 'string'}, 'offset': {'type': 'integer'}, 'limit': {'type': 'integer'}, 'full_lines': {'type': 'boolean'}}, 'required': ['path']}},
    {'name': 'write_file', 'description': 'Create or replace a whole text file.',
     'input_schema': {'type': 'object', 'properties': {'path': {'type': 'string'}, 'content': {'type': 'string'}}, 'required': ['path', 'content']}},
    {'name': 'edit_file', 'description': 'Replace one exact piece of text in a file. old must occur exactly once.',
     'input_schema': {'type': 'object', 'properties': {'path': {'type': 'string'}, 'old': {'type': 'string'}, 'new': {'type': 'string'}}, 'required': ['path', 'old', 'new']}},
    {'name': 'view_image', 'description': 'Look at a picture file (png, jpg, webp). It is shrunk so its longer side is at most max_side pixels (default 1100, up to 1600). Give crop as [x0,y0,x1,y1] in the picture\'s own pixels to look closely at one part.',
     'input_schema': {'type': 'object', 'properties': {'path': {'type': 'string'}, 'max_side': {'type': 'integer'}, 'crop': {'type': 'array', 'items': {'type': 'integer'}}}, 'required': ['path']}},
    {'name': 'finish', 'description': 'Call once, when the stage is done and the report file is written.',
     'input_schema': {'type': 'object', 'properties': {'summary': {'type': 'string'}}, 'required': ['summary']}},
]

def ab(p): return p if os.path.isabs(p) else os.path.join(WORK, p)
def cut(s, n=9000): return s if len(s) <= n else s[:n // 2] + f'\n... [{len(s) - n} characters cut] ...\n' + s[-n // 2:]
def run_tool(name, a):
    try:
        if name == 'bash':
            if 'builder/.key' in a['command'] or 'builder/agent' in a['command'] or 'cat .key' in a['command']: return 'refused: that file is not part of the job'
            r = subprocess.run(a['command'], shell=True, cwd=WORK, env=ENV, capture_output=True, text=True, timeout=min(int(a.get('timeout_s') or 180), 900))
            out = (r.stdout + (('\n[stderr]\n' + r.stderr) if r.stderr.strip() else '')).strip()
            return cut('\n'.join(l for l in out.split('\n') if 'GPU stall' not in l) or '(no output)') + (f'\n[exit {r.returncode}]' if r.returncode else '')
        if name == 'read_file':
            L = open(ab(a['path']), errors='replace').read().split('\n'); o = max(1, int(a.get('offset') or 1)); n = int(a.get('limit') or 400); w = 100000 if a.get('full_lines') else 1200
            body = '\n'.join(f'{i}\t{l if len(l) <= w else l[:w] + " ...[cut, " + str(len(l)) + " chars]"}' for i, l in enumerate(L[o - 1:o - 1 + n], o))
            return cut(body, 60000) + (f'\n[{len(L)} lines in all]' if len(L) > o - 1 + n else '')
        if name == 'write_file':
            p = ab(a['path']); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w').write(a['content']); return f'wrote {len(a["content"])} characters'
        if name == 'edit_file':
            p = ab(a['path']); s = open(p).read(); c = s.count(a['old'])
            if c != 1: return f'not done: old occurs {c} times'
            open(p, 'w').write(s.replace(a['old'], a['new'])); return 'done'
        if name == 'view_image':
            im = Image.open(ab(a['path'])).convert('RGB'); size = im.size
            if a.get('crop'): im = im.crop(tuple(a['crop']))
            m = min(int(a.get('max_side') or 1100), 1600); im.thumbnail((m, m), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=86)
            return [{'type': 'text', 'text': f'{a["path"]}: {size[0]}x{size[1]} pixels, shown at {im.size[0]}x{im.size[1]}'}, {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}]
    except subprocess.TimeoutExpired: return 'timed out'
    except Exception as e: return f'error: {type(e).__name__}: {str(e)[:500]}'
    return 'unknown tool'

def log(s):
    open(LOG, 'a').write(s + '\n')
def dump(o): return o.model_dump(exclude_none=True) if hasattr(o, 'model_dump') else o

msgs = [{'role': 'user', 'content': [{'type': 'text', 'text': brief}]}]
tot = dict(turns=0, input=0, cache_read=0, cache_write=0, output=0, state='running', last='')
if os.path.exists(SAVE) and '--resume' in sys.argv:
    d = json.load(open(SAVE)); msgs, tot = d['msgs'], d['tot']; tot['state'] = 'running'; RESUMED = True
SYSTEM = [{'type': 'text', 'text': 'You are a careful 3D model builder working alone in a Linux workspace through tools. Nobody answers questions while you work, so decide and write down what you decided. Work in small verified steps: change, build, take pictures, look at them. Say nothing between tool calls beyond a line or two.', 'cache_control': {'type': 'ephemeral'}}]

def trim(msgs, keep=40):          # when the conversation gets long, old tool results are stubbed out (the files are still on disk)
    for m in msgs:        # private reasoning is tied to the exact history before it, so once the history is changed it has to go
        if m['role'] == 'assistant' and isinstance(m['content'], list): m['content'] = [b for b in m['content'] if b.get('type') not in ('thinking', 'redacted_thinking')] or [{'type': 'text', 'text': '(thinking)'}]
    for m in msgs[1:-keep]:
        if m['role'] == 'user' and isinstance(m['content'], list):
            for b in m['content']:
                if b.get('type') == 'tool_result' and not b.get('_t'):
                    c = b['content']; txt = c if isinstance(c, str) else ' '.join(x.get('text', '') for x in c if x.get('type') == 'text')
                    b['content'] = txt[:300] + (' ...[old result trimmed]' if len(txt) > 300 or not isinstance(c, str) else ''); b['_t'] = 1
def clean(msgs):
    out = []
    for m in msgs:
        c = m['content']
        if isinstance(c, list): c = [{k: v for k, v in b.items() if k not in ('cache_control', '_t')} for b in c]
        out.append({'role': m['role'], 'content': c})
    last = out[-1]['content']
    if isinstance(last, list) and last: last[-1] = dict(last[-1], cache_control={'type': 'ephemeral'})
    return out

done = False; last_in = 0
if globals().get('RESUMED'): trim(msgs)
while not done and tot['turns'] < MAX_TURNS:
    if last_in > 200000: trim(msgs)
    try:
        with client.messages.stream(model=MODEL, max_tokens=32000, system=SYSTEM, tools=TOOLS, messages=clean(msgs), thinking={'type': 'adaptive'}, extra_body={'output_config': {'effort': EFFORT}}) as st:
            r = st.get_final_message()
    except anthropic.BadRequestError as e:
        log('BAD REQUEST ' + str(e)[:600])
        if 'long' in str(e).lower() or 'token' in str(e).lower(): trim(msgs, 12); last_in = 0; tot['turns'] += 1; continue
        tot['state'] = 'error: ' + str(e)[:300]; break
    except Exception as e:
        log('ERROR ' + type(e).__name__ + ' ' + str(e)[:400]); time.sleep(30); tot['turns'] += 1; continue
    u = r.usage; last_in = (u.input_tokens or 0) + (getattr(u, 'cache_read_input_tokens', 0) or 0) + (getattr(u, 'cache_creation_input_tokens', 0) or 0)
    tot['turns'] += 1; tot['input'] += u.input_tokens or 0; tot['cache_read'] += getattr(u, 'cache_read_input_tokens', 0) or 0; tot['cache_write'] += getattr(u, 'cache_creation_input_tokens', 0) or 0; tot['output'] += u.output_tokens or 0
    content = [dump(b) for b in r.content]; msgs.append({'role': 'assistant', 'content': content})
    said = ' '.join(b['text'] for b in content if b['type'] == 'text').strip()
    if said: log(f"[{tot['turns']}] SAYS {said[:500]}")
    uses = [b for b in content if b['type'] == 'tool_use']
    if r.stop_reason == 'max_tokens':
        msgs.pop(); msgs.append({'role': 'assistant', 'content': [{'type': 'text', 'text': '(my last step was too long and was cut off)'}]}); msgs.append({'role': 'user', 'content': [{'type': 'text', 'text': 'Your last step ran past the length limit and was dropped. Do it again in smaller pieces: write large files in parts, or with a script.'}]}); continue
    if not uses:
        if r.stop_reason == 'pause_turn': continue
        msgs.append({'role': 'user', 'content': [{'type': 'text', 'text': 'Nobody is reading this as you go. Keep working with the tools, and call finish when the stage is done and the report is written.'}]}); continue
    res = []
    for b in uses:
        if b['name'] == 'finish': done = True; tot['last'] = b['input'].get('summary', ''); out = 'ok'
        else: out = run_tool(b['name'], b['input'])
        a = b['input']; brief_a = (a.get('command') or a.get('path') or '')[:160].replace('\n', ' ')
        log(f"[{tot['turns']}] {b['name']} {brief_a}  -> {(out if isinstance(out, str) else out[0]['text'])[:140]!r}")
        res.append({'type': 'tool_result', 'tool_use_id': b['id'], 'content': out})
    msgs.append({'role': 'user', 'content': res})
    json.dump(tot, open(STATUS, 'w')); json.dump({'msgs': msgs, 'tot': tot}, open(SAVE, 'w'))
if tot['state'] == 'running': tot['state'] = 'finished' if done else 'stopped at the turn limit'
json.dump(tot, open(STATUS, 'w')); log('END ' + json.dumps(tot)[:1500])
