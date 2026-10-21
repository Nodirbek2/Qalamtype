// Procedural engine voices: small triples, classic inline-fours and deep V8s.
// These are synthesized game effects, not manufacturer recordings.
export const ENGINE_VOICES = {
 tico: {idle:48, rev:165, tone:'sawtooth', harmonic:1.5, mix:.21, cutoff:640, rumble:.10},
 jiguli: {idle:33, rev:116, tone:'square', harmonic:2, mix:.13, cutoff:420, rumble:.28},
 nexia1: {idle:40, rev:143, tone:'sawtooth', harmonic:2, mix:.18, cutoff:570, rumble:.16},
 nexia2: {idle:43, rev:153, tone:'triangle', harmonic:2, mix:.28, cutoff:720, rumble:.12},
 damas: {idle:51, rev:155, tone:'square', harmonic:1.5, mix:.19, cutoff:600, rumble:.23},
 spark: {idle:53, rev:183, tone:'triangle', harmonic:1.5, mix:.30, cutoff:950, rumble:.08},
 lacetti: {idle:38, rev:136, tone:'sawtooth', harmonic:2, mix:.24, cutoff:590, rumble:.15},
 cobalt: {idle:44, rev:148, tone:'triangle', harmonic:3, mix:.19, cutoff:680, rumble:.13},
 gentra: {idle:36, rev:132, tone:'triangle', harmonic:2, mix:.35, cutoff:530, rumble:.18},
 malibu: {idle:31, rev:125, tone:'sawtooth', harmonic:3, mix:.15, cutoff:830, rumble:.22},
 tahoe: {idle:23, rev:91, tone:'sawtooth', harmonic:2, mix:.38, cutoff:350, rumble:.39},
 gwagon: {idle:26, rev:110, tone:'square', harmonic:2, mix:.32, cutoff:490, rumble:.45},
} as const;
export function engineVoice(car:string){return ENGINE_VOICES[car as keyof typeof ENGINE_VOICES]||ENGINE_VOICES.tico;}
export function roadStripeOffset(camera:number){return -((Math.max(0,camera)%100));}
