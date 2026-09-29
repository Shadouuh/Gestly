# Debug Session: importfromphoto-ocr

- Status: OPEN
- Session ID: `importfromphoto-ocr`
- Date: 2026-06-26

## Symptoms

- React warning: `Each child in a list should have a unique "key" prop.`
- OCR extraction quality is poor and the catalog text is not being parsed correctly.

## Hypotheses

1. A `map()` render in `ImportFromPhoto.jsx` is missing a stable `key`.
2. OCR engines return compacted text and the current postprocessing fails to split product name and price.
3. The review UI does not surface enough raw engine evidence, making good/bad OCR outputs look equivalent.
4. Bounding boxes or synthetic segmentation are too weak for single-line merged outputs.
5. A frontend rendering issue and an OCR parsing issue are happening at the same time but are independent defects.

## Plan

1. Inspect the exact React render site around the warning line.
2. Inspect runtime OCR outputs already produced by the backend.
3. Add minimal instrumentation if needed.
4. Apply the smallest fixes possible.
5. Re-run and compare results.
