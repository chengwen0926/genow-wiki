"""Export one checked master without touching clips from another production group."""
from pathlib import Path
import argparse,json,subprocess
base=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('master',nargs='?',type=Path)
parser.add_argument('--group',choices=['base','workflow','complete'],default='base')
args=parser.parse_args()
groups={'complete':('complete-video/complete-master.mp4',['paint-mark.mp4','shared-organize.mp4']),'base':('video/tutorials-master.mp4',['image-setup.mp4','reference-guide.mp4','video-setup.mp4','canvas-connect.mp4']), 'workflow':('workflow-video/workflow-master.mp4',['workflow-import.mp4'])}
relative,names=groups[args.group]
master=args.master or base/relative
output=base.parent.parent/'assets/tutorials'
manifest=json.loads((output/'manifest.json').read_text())
by_name={v['file']:v for v in manifest['videos']}
offset=0
for name in names:
    video=by_name[name]
    target=output/name
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(offset),'-i',str(master),'-t',str(video['duration']),'-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],check=True)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss','1','-i',str(target),'-frames:v','1','-q:v','2',str(output/video['poster'])],check=True)
    offset+=video['duration']
    print(target.name,target.stat().st_size,'bytes')
