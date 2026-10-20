# Engine sound assets v3

Original four-second combustion-pulse sound designs rendered by scripts/render-race-engines.py. All eleven files are different, with three/four/six/eight/ten/sixteen cylinder signatures, exhaust resonances, roughness and turbo layers. These are game effects, not manufacturer recordings. Nexia 1, Lacetti, Cobalt and Gentra include generated ElevenLabs Sound Effects v2 texture layers retained as *-raw.mp3. Other ElevenLabs generations were blocked by rate limits, so their final assets use original synthesis.

Premium inspiration: Gentra boxer sports car; Malibu Ferrari-style V8; Tahoe Lamborghini-style V10; G-wagon Bugatti-style W16. Visual car models, prices and ownership remain unchanged. Preview and race use the same MP3. Web Audio decodes on demand, caches buffers, adjusts playback rate and gain to motion, and silences on pause/exit. Procedural audio remains a fallback if downloading fails.
