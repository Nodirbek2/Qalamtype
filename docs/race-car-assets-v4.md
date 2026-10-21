# Garage catalog refresh — 21 October 2026

Built-in imagegen generated original transparent side-profile sprites from real model references, then exported alpha-preserving 640px WebP files into public/images/race-cars-v3. Nexia 1 and Nexia 2 replace the earlier illustrations; Damas is new. Image source canvas is 1774×887; wheel coordinates in RacingCar match each sprite. Existing shape IDs remain stable and Damas uses shape 11, while catalog order inserts it after Nexia 2.

References:
- Nexia N100 front: https://img4.auto.cz/moje.auto.cz/img/galleries/4d7849f6b216c/4d78506136461.jpg
- Nexia N150 side: https://hdpic.club/uploads/posts/2021-11/1637945868_29-hdpic-club-p-deu-neksiya-n150-29.jpg
- Nexia N150 alternate: https://avatars.mds.yandex.net/get-autoru-vos/2168853/891e4f22476f0d1393230625ed18c2b1/1200x900
- Damas: https://files2.aster.kz/market/aster/2023-4/241157_a9c270dc-27a0-4d7d-b369-64b0c995acc6_L_resolution2133x1173.webp
- Manufacturer model: https://chevrolet.uz/damas

Prompt specifications:
- Nexia 1: forest green Daewoo Nexia N100 sedan (1996–2007), reference-correct rectangular lamps, flat hood, angular cabin, long trunk, four doors, triangular quarter glass, black rub strips and stock wheel covers.
- Nexia 2: silver Daewoo Nexia N150 (2008–2016), reproduce reference body proportions, N100-derived angular cabin, long trunk, large triangular quarter glass, black oval handles, tall rear lamps and N150 bumpers/headlights. No Aveo/Nexia 3/Lacetti substitution.
- Damas: classic white Chevrolet Damas passenger microvan, high flat roof, cab-over nose, sliding door and three side windows, small stock wheels, orange/dark blue factory stripe. No Move/Max or Labo. Final edit removed disconnected white fragments around the roof.
- All: one semi-realistic illustrated vehicle in strict 90-degree side profile facing right, exactly two round visible wheels, transparent landscape canvas, no people, floor, cast shadow, text or plate lettering.

Damas costs 850 coins in both the client and authenticated database catalog. It reuses the Tico sample audio as a temporary small-engine sound, with its own procedural voice configuration.
