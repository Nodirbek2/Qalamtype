"""Prepare recorded CC0 automotive audio; never synthesize oscillators.
Source files and licenses: public/audio/race-engines-v5/CREDITS.md.
Run from project root; source recordings live in ../real-engines.
"""
from pathlib import Path
import subprocess
import numpy as np
from scipy import signal
from scipy.io import wavfile
root=Path('../real-engines');out=Path('public/audio/race-engines-v5');out.mkdir(parents=True,exist_ok=True)
sr=24000
sources={}
for name in ['sedan','ferrari','lambo','maserati']:
 p=root/(name+('.wav' if name=='sedan' else '.mp3'))
 pcm=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-f','f32le','-ac','1','-ar',str(sr),'-'])
 sources[name]=np.frombuffer(pcm,dtype=np.float32).copy()
# Modest pitch offsets only; different recording segments/mixtures create each voice.
models=[('tico','sedan',0,1.07,1700,None),('jiguli','sedan',0,.88,1300,None),
 ('nexia1','sedan',0,.98,2200,('ferrari',8,.15)),('nexia2','sedan',0,1.02,2400,('maserati',3,.12)),
 ('spark','sedan',0,1.1,2500,None),('lacetti','ferrari',7,.9,2400,('sedan',0,.3)),
 ('cobalt','maserati',2.5,.93,2500,('sedan',0,.2)),('gentra','ferrari',13,.96,2700,None),
 ('malibu','ferrari',22,1,3200,None),('tahoe','lambo',10,1,3400,None),
 ('gwagon','lambo',23,.86,2800,('maserati',4,.28))]
def segment(name,start,pitch):
 x=sources[name];n=sr*4
 # Recordings shorter than a loop are repeated; no generated tonal material.
 pos=(int(start*sr)+np.arange(n)*pitch)%len(x)
 y=np.interp(pos,np.arange(len(x)),x)
 y-=y.mean();return y/max(.001,np.sqrt(np.mean(y*y)))
for name,source,start,pitch,cutoff,mix in models:
 x=segment(source,start,pitch)
 if mix:
  other,offset,amount=mix;x=(1-amount)*x+amount*segment(other,offset,1)
 x=signal.sosfiltfilt(signal.butter(3,[40,cutoff],btype='bandpass',fs=sr,output='sos'),x)
 # Overlap tail onto head for a continuous natural recording loop.
 cross=int(.12*sr);blend=np.linspace(0,1,cross)
 x[:cross]=x[-cross:]*(1-blend)+x[:cross]*blend;x=x[:-cross]
 # Equal RMS across cars with soft limiting, retaining the recorded texture.
 x*=.23/max(.001,np.sqrt(np.mean(x*x)));x=np.tanh(x)
 wav=out/(name+'.wav');wavfile.write(wav,sr,(x*32767).astype(np.int16))
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(wav),'-c:a','libmp3lame','-b:a','80k',str(out/(name+'.mp3'))],check=True)
 wav.unlink();print(name,round(float(np.sqrt(np.mean(x*x))),3))
