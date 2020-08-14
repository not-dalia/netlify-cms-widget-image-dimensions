import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from '@emotion/styled';
import { Map, List } from 'immutable';
import { once } from 'lodash';
import uuid from 'uuid/v4';
import { oneLine } from 'common-tags';
import { lengths, components, buttons, borders, effects, shadows } from 'netlify-cms-ui-default';
import { basename } from 'netlify-cms-lib-util';

const MAX_DISPLAY_LENGTH = 50;

const ImageWrapper = styled.div`
  flex-basis: 155px;
  width: 155px;
  height: 100px;
  margin-right: 20px;
  margin-bottom: 20px;
  border: ${borders.textField};
  border-radius: ${lengths.borderRadius};
  overflow: hidden;
  ${effects.checkerboard};
  ${shadows.inset};
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Image = props => <StyledImage role="presentation" {...props} />;

const MultiImageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const FileLink = styled.a`
  margin-bottom: 20px;
  font-weight: normal;
  color: inherit;
  &:hover,
  &:active,
  &:focus {
    text-decoration: underline;
  }
`;

const FileLinks = styled.div`
  margin-bottom: 12px;
`;

const FileLinkList = styled.ul`
  list-style-type: none;
`;

const FileWidgetButton = styled.button`
  ${buttons.button};
  ${components.badge};
`;

const FileWidgetButtonRemove = styled.button`
  ${buttons.button};
  ${components.badgeDanger};
  margin-top: 12px;
`;

function isMultiple(value) {
  return Array.isArray(value) || List.isList(value);
}

const warnDeprecatedOptions = once(field =>
  console.warn(oneLine`
  Netlify CMS config: ${field.get('name')} field: property "options" has been deprecated for the
  ${field.get('widget')} widget and will be removed in the next major release. Rather than
  \`field.options.media_library\`, apply media library options for this widget under
  \`field.media_library\`.
`),
);

export default function withFileControl({ forImage } = {}) {
  return class FileControl extends React.Component {
    static propTypes = {
      field: PropTypes.object.isRequired,
      getAsset: PropTypes.func.isRequired,
      mediaPaths: ImmutablePropTypes.map.isRequired,
      onAddAsset: PropTypes.func.isRequired,
      onChange: PropTypes.func.isRequired,
      onRemoveInsertedMedia: PropTypes.func.isRequired,
      onOpenMediaLibrary: PropTypes.func.isRequired,
      onClearMediaControl: PropTypes.func.isRequired,
      onRemoveMediaControl: PropTypes.func.isRequired,
      classNameWrapper: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
        ImmutablePropTypes.listOf(PropTypes.string),
      ]),
      t: PropTypes.func.isRequired,
    };

    static defaultProps = {
      value: '',
    };

    constructor(props) {
      super(props);
      this.controlID = uuid();
      this.state = { sizeError: false }
    }

    shouldComponentUpdate(nextProps) {
      /**
       * Always update if the value or getAsset changes.
       */
      if (this.props.value !== nextProps.value || this.props.getAsset !== nextProps.getAsset) {
        return true;
      }

      /**
       * If there is a media path for this control in the state object, and that
       * path is different than the value in `nextProps`, update.
       */
      const mediaPath = nextProps.mediaPaths.get(this.controlID);
      if (mediaPath && nextProps.value !== mediaPath) {
        return true;
      }

      return false;
    }

    componentDidUpdate() {
      const { mediaPaths, value, onRemoveInsertedMedia, onChange } = this.props;
      const mediaPath = mediaPaths.get(this.controlID);
      if (mediaPath && mediaPath !== value) {
        onChange(mediaPath);
      } else if (mediaPath && mediaPath === value) {
        onRemoveInsertedMedia(this.controlID);
      }
    }

    componentWillUnmount() {
      if (!this.props.onRemoveMediaControl) {
        this.props.onRemoveMediaControl = (id) => {
          return (_dispatch, getState) => {
            const state = getState();
            const mediaLibrary = state.mediaLibrary.get('externalLibrary');
            if (mediaLibrary) {
              mediaLibrary.onRemoveControl({ id });
            }
          }
        }
      }
      this.props.onRemoveMediaControl(this.controlID);
    }

    handleChange = e => {
      const { field, onOpenMediaLibrary, value } = this.props;
      e.preventDefault();
      let mediaLibraryFieldOptions;
      this.setState({ sizeError: false });
      /**
       * `options` hash as a general field property is deprecated, only used
       * when external media libraries were first introduced. Not to be
       * confused with `options` for the select widget, which serves a different
       * purpose.
       */
      if (field.hasIn(['options', 'media_library'])) {
        warnDeprecatedOptions(field);
        mediaLibraryFieldOptions = field.getIn(['options', 'media_library'], Map());
      } else {
        mediaLibraryFieldOptions = field.get('media_library', Map());
      }

      return onOpenMediaLibrary({
        controlID: this.controlID,
        forImage,
        privateUpload: field.get('private'),
        value,
        allowMultiple: !!mediaLibraryFieldOptions.get('allow_multiple', true),
        config: mediaLibraryFieldOptions.get('config'),
        field,
      });
    };

    handleRemove = e => {
      e.preventDefault();
      if (!this.props.onClearMediaControl) {
        this.props.onClearMediaControl = (id) => {
          return (_dispatch, getState) => {
            const state = getState();
            const mediaLibrary = state.mediaLibrary.get('externalLibrary');
            if (mediaLibrary) {
              mediaLibrary.onClearControl({ id });
            }
          };
        }
        
      }
      this.props.onClearMediaControl(this.controlID);
      return this.props.onChange('');
    };

    getValidateValue = () => {
      const { value } = this.props;
      if (value) {
        return isMultiple(value) ? value.map(v => basename(v)) : basename(value);
      }

      return value;
    };

    renderFileLink = value => {
      const size = MAX_DISPLAY_LENGTH;
      if (!value || value.length <= size) {
        return value;
      }
      const text = `${value.substring(0, size / 2)}\u2026${value.substring(
        value.length - size / 2 + 1,
        value.length,
      )}`;
      return (
        <FileLink href={value} rel="noopener" target="_blank">
          {text}
        </FileLink>
      );
    };

    renderFileLinks = () => {
      const { value } = this.props;

      if (isMultiple(value)) {
        return (
          <FileLinks>
            <FileLinkList>
              {value.map(val => (
                <li key={val}>{this.renderFileLink(val)}</li>
              ))}
            </FileLinkList>
          </FileLinks>
        );
      }
      return <FileLinks>{this.renderFileLink(value)}</FileLinks>;
    };

    renderImages = () => {
      const { getAsset, value, field } = this.props;

      if (isMultiple(value)) {
        return (
          <MultiImageWrapper>
            {value.map(val => (
              <ImageWrapper key={val}>
                <Image src={getAsset(val, field) || ''} />
              </ImageWrapper>
            ))}
          </MultiImageWrapper>
        );
      }

      const src = getAsset(value, field);
      return (
        <ImageWrapper>
          <Image src={src || ''} 
          ref={el => this.imgEl = el}
          onLoad={(el) => this.handleSize(el)}/>
        </ImageWrapper>
      );
    };

    handleSize = el => {
      console.log('handling size')
      const exactHeight = this.props.field.get('exact_height', 0)
      const exactWidth = this.props.field.get('exact_width', 0)
      const minHeight = this.props.field.get('min_height', 0)
      const minWidth = this.props.field.get('min_width', 0)
      const imgHeight = el.target.naturalHeight
      const imgWidth = el.target.naturalWidth
      
      if ((exactHeight > 0 && imgHeight !== exactHeight) || (imgHeight < minHeight)) {
        this.setState({ sizeError: true });
        this.handleRemove(el)
      } else if ((exactWidth > 0 && imgWidth !== exactWidth) || (imgWidth < minWidth)) {
        this.setState({ sizeError: true });
        this.handleRemove(el)
      } else {
        this.setState({ sizeError: false });
      }
    }

    renderSelection = subject => {
      const { t } = this.props;
      return (
        <div>
          {forImage ? this.renderImages() : null}
          <div>
            {forImage ? null : this.renderFileLinks()}
            <FileWidgetButton onClick={this.handleChange}>
              {t ? t(`editor.editorWidgets.${subject}.chooseDifferent`) : "Choose a Different Image"}
            </FileWidgetButton>
            <FileWidgetButtonRemove onClick={this.handleRemove}>
              {t ? t(`editor.editorWidgets.${subject}.remove`) : "Remove"}
            </FileWidgetButtonRemove>
          </div>
        </div>
      );
    };

    renderNoSelection = subject => {
      const { t } = this.props;
      return (
        <FileWidgetButton onClick={this.handleChange}>
          {t ? t(`editor.editorWidgets.${subject}.choose`) : 'Choose'}
        </FileWidgetButton>
      );
    };

    renderError = () => {
      const exactHeight = this.props.field.get('exact_height', 0)
      const exactWidth = this.props.field.get('exact_width', 0)
      const minHeight = this.props.field.get('min_height', 0)
      const minWidth = this.props.field.get('min_width', 0)
      let errorMessage = `Image size must be equal to ${exactWidth}x${exactHeight} or no less than ${minWidth}x${minHeight}` 
      return (
        <div style={{color: '#ff003b',
        'font-size': '0.85rem',
        'border-radius': 'var(--borderRadius)',
        background: '#fbe0d7',
        padding: '4px 10px',
        'margin-top': '5px'}}>
          {this.props.field.get('validation', errorMessage)}
        </div>
      )
    }

    render() {
      const { value, classNameWrapper } = this.props;
      const subject = forImage ? 'image' : 'file';

      return (
        <div className={classNameWrapper}>
          <span>{value ? this.renderSelection(subject) : this.renderNoSelection(subject)}</span>
          <div>{this.state.sizeError ? this.renderError() : '' }</div>
        </div>
      );
    }
  };
}