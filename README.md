# netlify-cms-widget-image-dimensions

A modified Netlify CMS image widget that allows restricting image dimensions. Hacky and experimental.

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
      - { name: <fieldname>, label: <fieldlabel>, widget: <name> }
```

## Configuration

Explain any custom configuration steps here, or omit the section if there are none.

## Support

For help with this widget, open an [issue](https://github.com/<user>/<repo>) or ask the Netlify CMS community in [Gitter](https://gitter.im/netlify/netlifycms).
