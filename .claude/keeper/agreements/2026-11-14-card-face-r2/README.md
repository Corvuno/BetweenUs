# Card face, round 2 (#159)

The combined face shown to the owner: https://claude.ai/artifact/CSVVS4WtQ6m2Vd4DPKvFdZ
Round 1 (three sketches): https://claude.ai/artifact/KQQCXwphNJAPTEnxiK8xkr

`card-face.css` is the design's own code, laid over the live app for the pictures. It needs one
element in `#card`, before `.card-body-inner`: `<i class="cf"><i></i><i></i><i></i><i></i></i>`,
and `--cat` on `#card` set to the name's colour (`labelColor(levelColor(level))`; the Wildcard
takes `--gold-l`). It is a prototype: the name is centred with a transform, which the card's
change animation also uses, so the build centres it another way.

Owner on round 1: "Love these designs. They are really good!!" The name in the line "is the
best"; "do also love the more colour of 2. And the lines of 3. (Don't like the tab at all)."
"They all still look like cards. That's good."
