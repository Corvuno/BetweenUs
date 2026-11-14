# Card face, round 3 (#159)

Three variants shown to the owner: https://claude.ai/artifact/VSkhxZ2Pku3gRhVrRDhmJD
Round 2 (turned down): https://claude.ai/artifact/CSVVS4WtQ6m2Vd4DPKvFdZ, code in the r2 folder.

Owner on round 2: "I think that's a wrong direction; The letters still sit in a tab, just a
cutout. The glow is too much contrived. I liked the stripes of 1 and lines of three. And I liked
the colours of 2." "Three cards are more then enough."

`card-face.css` is laid over the live app. It needs `<i class="cf">` in `#card` before
`.card-body-inner`, holding the fan `<svg>` and four `<i>` corners, `--cat` on `#card` (the
name's colour) and `vA`, `vB` or `vC` on `body`:
- vA: the inner frame line in the category's colour.
- vB: an even layer of the category's colour inside the gold frame.
- vC: the fan in the category's colour behind the question.
Shared: the name free at the top with stacked stripes fading outward, an unbroken double gold
frame with stepped corners, no glow; After Dark keeps its own ground and edge.
