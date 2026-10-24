"""Split the checked 60-second HyperFrames master into four guide clips."""
from pathlib import Path
import json,subprocess,sys
base=Path(__file__).resolve().parent
wiki=base.parent.parent
master=Path(sys.argv[1]) if len(sys.argv)>1 else base/'video/tutorials-master.mp4'
output=wiki/'assets/tutorials'
manifest=json.loads((output/'manifest.json').read_text())
for index,video in enumerate(manifest['videos']):
    target=output/video['file']
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(index*15),'-i',str(master),'-t','15','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],check=True)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss','1','-i',str(target),'-frames:v','1','-q:v','2',str(output/video['poster'])],check=True)
    print(target.name, target.stat().st_size,'bytes')
