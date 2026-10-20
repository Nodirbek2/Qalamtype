"""Original combustion-pulse game effects. Entirely local synthesis; no external audio.
Run from project root. No manufacturer recordings are included.
"""
from pathlib import Path
import subprocess
import numpy as np
from scipy import signal
from scipy.io import wavfile

out=Path('public/audio/race-engines-v4');out.mkdir(parents=True,exist_ok=True)
sr=22050;seconds=4;n=sr*seconds;t=np.arange(n)/sr
# Cylinders, RPM, exhaust resonance, roughness, turbo, seed.
voices=[('tico',3,2200,180,.65,0),('jiguli',4,1800,135,.8,0),
 ('nexia1',4,2400,260,.4,0),('nexia2',4,2700,340,.25,.05),
 ('spark',3,3000,420,.15,0),('lacetti',4,3300,220,.55,0),
 ('cobalt',6,3000,380,.3,.23),('gentra',6,3600,560,.25,0),
 ('malibu',8,4200,950,.18,.04),('tahoe',10,4800,1500,.1,.08),
 ('gwagon',16,3000,480,.38,.4)]
for index,(name,cyl,rpm,res,rough,turbo) in enumerate(voices):
 rng=np.random.default_rng(370+index)
 firing=cyl*rpm/120
 # Integer loop cycles and periodic crankshaft fluctuations avoid seam clicks.
 cycles=round(firing*seconds)
 phase=2*np.pi*(cycles*t/seconds + .035*rough*np.sin(2*np.pi*7*t))
 crank=2*np.pi*round(rpm/60*seconds)*t/seconds
 x=np.zeros(n)
 for h in range(1,33):
  freq=firing*h
  if freq>sr*.44:break
  # Exhaust resonances shape a different spectral signature for each motor.
  amp=(.24+np.exp(-((freq-res)/(res*.65))**2)*1.4)/(h**(.65+index*.025))
  x+=amp*np.sin(phase*h+.3*np.sin(crank)*rough)
 x*=1+rough*.2*np.sin(crank)+.08*np.sin(2*np.pi*3*t)
 noise=rng.normal(size=n)
 sos=signal.butter(2,[max(60,res*.3),min(8000,res*3)],btype='bandpass',fs=sr,output='sos')
 breath=signal.sosfilt(sos,noise)
 x=np.tanh(x*(1.0+rough))+.24*breath*(.5+.5*np.sin(phase))
 if turbo:
  x+=turbo*(.22*np.sin(2*np.pi*round((1800+index*170)*seconds)*t/seconds)+.6*signal.sosfilt(signal.butter(2,1800,btype='highpass',fs=sr,output='sos'),noise))
 # Crossfade a short periodic boundary and normalize each preview equally.
 fade=220
 x[:fade]*=np.linspace(0,1,fade);x[-fade:]*=np.linspace(1,0,fade)
 x-=x.mean();x=.78*x/max(.01,np.max(np.abs(x)))
 wav=out/(name+'.wav');wavfile.write(wav,sr,(x*32767).astype(np.int16))
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(wav),'-codec:a','libmp3lame','-b:a','64k',str(out/(name+'.mp3'))],check=True)
 wav.unlink()
 print(name,round(float(np.sqrt(np.mean(x*x))),3))
