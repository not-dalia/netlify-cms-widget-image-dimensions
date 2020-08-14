# netlify-cms-widget-image-dimensions

A modified Netlify CMS image widget that allows restricting image dimensions. 

**Warning**: Very hacky and experimental.

## Install

As an npm package:

```shell
npm install --save netlify-cms-widget-image-dimensions
```

```js
import { ImageDimensionsControl, ImageDimensionsPreview, ImageDimensionsSchema } from 'netlify-cms-widget-image-dimensions'

CMS.registerWidget('image_dimensions', ImageDimensionsControl, ImageDimensionsPreview, ImageDimensionsSchema)
```

Via `script` tag:

```html
<script src="https://unpkg.com/netlify-cms-widget-image-dimensions@^1.0.0"></script>

<script>
  CMS.registerWidget('image_dimensions', ImageDimensionsControl, ImageDimensionsPreview, ImageDimensionsSchema)
</script>
```

## How to use

Add to your Netlify CMS configuration:

```yaml
    fields:
      - { name: <fieldname>, label: <fieldlabel>, widget: image_dimensions }
```

To set a limit on the minimum width/height of the image, use `min_width` and `min_height`. To set the width/height to be an exact value, use `exact_width` and `exact_height`. If you configure both `min_width` and `exact_width` then `min_width` will be ignored, and likewise for `min_height` and `exact_height`. 

To configure the validation/error message (*highly recommended*), use `validation`. 

```yaml
    fields:
      - name: <fieldname>
        label: <fieldlabel>
        widget: image_dimensions
        exact_width: 300
        exact_height: 200
        validation: "Image must be 300x200px"
```